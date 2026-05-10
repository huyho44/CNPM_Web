import { useState, useEffect } from 'react';
import { Ticket, Printer, AlertTriangle, CheckCircle, XCircle, Copy, LogOut, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import * as api from '../api/parkingApi';

// ── Local ticket record  ─────────────────────────────────────
interface LocalTicket {
  ticket_code:      string;
  session_id:       string | null;
  gate_label:       string;
  gate_id:          string;
  issued_by:        'KIOSK' | 'OPERATOR';
  issued_at:        string;
  status:           'ACTIVE' | 'USED';
  duration_minutes?: number | null;
}

// ── Label helpers ─────────────────────────────────────────────────────────────
function gateLabelEntry(g: api.GateRow) {
  return `${g.gate_code}  (${g.zone_name} — Entry)`;
}
function gateLabelExit(g: api.GateRow) {
  return `${g.gate_code}  (${g.zone_name} — Exit)`;
}
function operatorLabel(o: api.OperatorRow) {
  return `${o.full_name}  (${o.university_id}${o.sub_role ? ' · ' + o.sub_role : ''})`;
}

export default function TicketPage() {
  // ── DB data ────────────────────────────────────────────────
  const [entryGates,   setEntryGates]   = useState<api.GateRow[]>([]);
  const [exitGates,    setExitGates]    = useState<api.GateRow[]>([]);
  const [operators,    setOperators]    = useState<api.OperatorRow[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [loadError,    setLoadError]    = useState<string | null>(null);

  // ── Form state ─────────────────────────────────────────────
  const [entryGateId,  setEntryGateId]  = useState('');
  const [issuedBy,     setIssuedBy]     = useState<'KIOSK' | 'OPERATOR'>('KIOSK');
  const [operatorId,   setOperatorId]   = useState<string | null>(null);

  // ── Exit form state ────────────────────────────────────────
  const [exitTicketCode, setExitTicketCode] = useState('');
  const [exitGateId,     setExitGateId]     = useState('');

  // ── Failure simulation ─────────────────────────────────────
  const [printerFail, setPrinterFail] = useState(false);
  const [barrierFail, setBarrierFail] = useState(false);

  // ── UI state ───────────────────────────────────────────────
  const [loading,      setLoading]      = useState<'issue' | 'exit' | null>(null);
  const [tickets,      setTickets]      = useState<LocalTicket[]>([]);
  const [lastTicket,   setLastTicket]   = useState<LocalTicket | null>(null);
  const [exitFeedback, setExitFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [copied,       setCopied]       = useState(false);

  // ── Load gates + operators from DB on mount ────────────────
  useEffect(() => {
    setLoadingData(true);
    Promise.all([api.getGates(), api.getOperators()])
      .then(([gates, ops]) => {
        const entry = gates.filter(g => g.direction === 'ENTRY' || g.direction === 'BOTH');
        const exit  = gates.filter(g => g.direction === 'EXIT'  || g.direction === 'BOTH');
        setEntryGates(entry);
        setExitGates(exit);
        setOperators(ops);
        if (entry.length) setEntryGateId(entry[0].gate_id);
        if (exit.length)  setExitGateId(exit[0].gate_id);
        setLoadError(null);
      })
      .catch(err => setLoadError((err as Error).message ?? 'Failed to load data'))
      .finally(() => setLoadingData(false));
  }, []);

  // ── Ticket logs from DB ────────────────────────────────────
  const [logs,        setLogs]        = useState<api.TicketLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError,   setLogsError]   = useState<string | null>(null);

  function refreshLogs() {
    setLogsLoading(true);
    api.getTicketLogs()
      .then(data => { setLogs(data); setLogsError(null); })
      .catch(err  => setLogsError((err as Error).message ?? 'Failed to load logs'))
      .finally(() => setLogsLoading(false));
  }

  // Initial log load (runs after gates/operators load)
  useEffect(() => { refreshLogs(); }, []);

  // UC-02: Issue ticket
  async function handleIssue() {
    if (printerFail) { alert('Printer Error: Cannot print ticket. Please check the printer.'); return; }
    if (barrierFail) { alert('Barrier Error: Barrier is stuck. Manual intervention is required.'); return; }

    setLoading('issue');
    try {
      const data = await api.issueTempTicket(
        entryGateId,
        issuedBy,
        issuedBy === 'OPERATOR' ? operatorId : null,
      );
      if (data.result === 'GRANTED' && data.ticket_code) {
        const gLabel = entryGates.find(g => g.gate_id === entryGateId);
        const t: LocalTicket = {
          ticket_code: data.ticket_code,
          session_id:  data.session_id,
          gate_label:  gLabel ? gateLabelEntry(gLabel) : entryGateId,
          gate_id:     entryGateId,
          issued_by:   issuedBy,
          issued_at:   new Date().toLocaleTimeString(),
          status:      'ACTIVE',
        };
        setTickets(prev => [t, ...prev]);
        setLastTicket(t);
        setExitTicketCode(data.ticket_code);
        // Refresh the access_logs table
        refreshLogs();
      } else {
        alert(`${data.result}: ${data.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof TypeError
        ? 'Backend offline — start the Express server.'
        : String((err as { message?: string }).message ?? err);
      alert(`Error: ${msg}`);
    } finally {
      setLoading(null);
    }
  }

  // UC-02: Ticket exit
  async function handleExit() {
    if (!exitTicketCode.trim()) { alert('Please enter a ticket code.'); return; }
    setLoading('exit');
    setExitFeedback(null);
    try {
      const data = await api.tempTicketExit(exitTicketCode.trim(), exitGateId);
      setExitFeedback({ ok: data.result === 'GRANTED', message: data.message });
      if (data.result === 'GRANTED') {
        setTickets(prev => prev.map(t =>
          t.ticket_code === exitTicketCode.trim()
            ? { ...t, status: 'USED', duration_minutes: data.duration_minutes }
            : t,
        ));
        if (lastTicket?.ticket_code === exitTicketCode.trim()) {
          setLastTicket(t => t ? { ...t, status: 'USED', duration_minutes: data.duration_minutes } : t);
        }
        // Refresh the access_logs table
        refreshLogs();
      }
    } catch (err: unknown) {
      const msg = err instanceof TypeError
        ? 'Backend offline.'
        : String((err as { message?: string }).message ?? err);
      setExitFeedback({ ok: false, message: msg });
    } finally {
      setLoading(null);
    }
  }

  function copyRef(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading skeleton for selects ──────────────────────────
  const SelectSkeleton = () => <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left column: Issue + Exit forms ── */}
      <div className="lg:col-span-2 space-y-4">

        {/* Load error banner */}
        {loadError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Could not load data from backend: {loadError}</span>
          </div>
        )}

        {/* Issue form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Ticket className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900">Issue Temporary Ticket (UC-02)</h2>
          </div>

          <div className="space-y-4">
            {/* Entry gate */}
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Entry Gate</label>
              {loadingData ? <SelectSkeleton /> : (
                <select value={entryGateId} onChange={e => setEntryGateId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  {entryGates.map(g => (
                    <option key={g.gate_id} value={g.gate_id}>{gateLabelEntry(g)}</option>
                  ))}
                </select>
              )}
              {!loadingData && entryGateId && (
                <p className="text-[10px] text-gray-400 mt-1 font-mono">{entryGateId}</p>
              )}
            </div>

            {/* Issued by */}
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Issued By</label>
              <div className="flex gap-2">
                {(['KIOSK', 'OPERATOR'] as const).map(v => (
                  <button key={v} onClick={() => setIssuedBy(v)}
                    className={cn('flex-1 py-2 rounded-lg text-sm font-bold border transition-colors',
                      issuedBy === v
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100')}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Operator selector — only when OPERATOR is selected */}
            {issuedBy === 'OPERATOR' && (
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Operator</label>
                {loadingData ? <SelectSkeleton /> : operators.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No STAFF operators found in DB.</p>
                ) : (
                  <select value={operatorId ?? ''}
                    onChange={e => setOperatorId(e.target.value || null)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">— select operator —</option>
                    {operators.map(o => (
                      <option key={o.user_id} value={o.user_id}>{operatorLabel(o)}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Failure toggles */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Simulate Hardware Failure
              </p>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={printerFail} onChange={e => setPrinterFail(e.target.checked)} className="rounded" />
                <Printer className="w-3.5 h-3.5" /> Printer Error
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={barrierFail} onChange={e => setBarrierFail(e.target.checked)} className="rounded" />
                🚧 Barrier Error
              </label>
            </div>

            <button onClick={handleIssue} disabled={loading !== null || loadingData || !entryGateId}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading === 'issue' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
              Issue Ticket
            </button>
          </div>
        </div>

        {/* Ticket exit form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-gray-900">Ticket Exit</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Ticket Code</label>
              <input value={exitTicketCode} onChange={e => setExitTicketCode(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="TKT-YYYYMMDD-XXXXXX" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Exit Gate</label>
              {loadingData ? <SelectSkeleton /> : (
                <select value={exitGateId} onChange={e => setExitGateId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  {exitGates.map(g => (
                    <option key={g.gate_id} value={g.gate_id}>{gateLabelExit(g)}</option>
                  ))}
                </select>
              )}
              {!loadingData && exitGateId && (
                <p className="text-[10px] text-gray-400 mt-1 font-mono">{exitGateId}</p>
              )}
            </div>
            <button onClick={handleExit} disabled={loading !== null || !exitGateId}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading === 'exit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Process Exit
            </button>

            <AnimatePresence>
              {exitFeedback && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={cn('rounded-lg p-3 flex items-start gap-2 text-sm',
                    exitFeedback.ok
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800')}>
                  {exitFeedback.ok
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    : <XCircle    className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  {exitFeedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Last ticket preview */}
        <AnimatePresence>
          {lastTicket && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-xl border-2 border-dashed border-purple-300 p-5">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Latest Ticket
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-lg text-purple-800">{lastTicket.ticket_code}</span>
                  <button onClick={() => copyRef(lastTicket.ticket_code)}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
                    <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>🚪 {lastTicket.gate_label}</p>
                  <p>👤 {lastTicket.issued_by}</p>
                  <p>⏱ Issued: {lastTicket.issued_at}</p>
                  {lastTicket.session_id && (
                    <p className="font-mono text-gray-300">session: {lastTicket.session_id.slice(0, 12)}…</p>
                  )}
                </div>
                <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold',
                  lastTicket.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                  {lastTicket.status}
                  {lastTicket.duration_minutes != null && ` · ${lastTicket.duration_minutes} min`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: access_logs table ── */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Ticket Access Log</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live from <span className="font-mono">access_logs</span> · TEMPORARY_TICKET events</p>
          </div>
          <div className="flex items-center gap-3">
            {logsLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
            <span className="text-xs text-gray-400">{logs.length} rows</span>
            <button onClick={refreshLogs}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {logsError && (
          <div className="px-6 py-3 flex items-center gap-2 bg-red-50 border-b border-red-100 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {logsError}
          </div>
        )}

        {!logsError && logs.length === 0 && !logsLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No temporary ticket events in the log yet.</p>
            <p className="text-xs mt-1 text-gray-300">Issue a ticket — it will appear here immediately after refresh.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold sticky top-0">
                <tr>
                  {['Time', 'Dir', 'Gate', 'Ticket Code', 'Issued By', 'Result', 'Reason'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(row => (
                  <tr key={row.log_id} className="hover:bg-gray-50">
                    {/* Time */}
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap font-mono">
                      {new Date(row.event_time).toLocaleTimeString()}
                      <span className="block text-[10px] text-gray-300">
                        {new Date(row.event_time).toLocaleDateString()}
                      </span>
                    </td>
                    {/* Direction */}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded',
                        row.direction === 'ENTRY' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700')}>
                        {row.direction === 'ENTRY' ? <LogOut className="w-3 h-3 rotate-180" /> : <LogOut className="w-3 h-3" />}
                        {row.direction}
                      </span>
                    </td>
                    {/* Gate */}
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      <span className="font-medium">{row.gate_code}</span>
                      <span className="block text-[10px] text-gray-400">{row.zone_name}</span>
                    </td>
                    {/* Ticket Code */}
                    <td className="px-4 py-3 font-mono text-xs text-purple-700 font-bold whitespace-nowrap">
                      {row.ticket_code ?? '—'}
                      {row.ticket_code && (
                        <button
                          onClick={() => setExitTicketCode(row.ticket_code!)}
                          className="ml-2 text-[10px] text-gray-400 hover:text-purple-600 transition-colors">
                          ↗ use
                        </button>
                      )}
                    </td>
                    {/* Issued By */}
                    <td className="px-4 py-3">
                      {row.issued_by ? (
                        <span className={cn('px-2 py-0.5 rounded font-bold text-[10px]',
                          row.issued_by === 'KIOSK' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700')}>
                          {row.issued_by}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    {/* Result */}
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold',
                        row.result === 'GRANTED' ? 'bg-emerald-100 text-emerald-700' :
                        row.result === 'DENIED'  ? 'bg-red-100 text-red-700' :
                                                   'bg-orange-100 text-orange-700')}>
                        {row.result}
                      </span>
                    </td>
                    {/* Deny Reason */}
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate" title={row.deny_reason ?? ''}>
                      {row.deny_reason ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
