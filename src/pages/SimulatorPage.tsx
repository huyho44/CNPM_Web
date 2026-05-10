import { useState, useEffect } from 'react';
import { ScanLine, LogIn, LogOut, CheckCircle, XCircle, Loader2, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import * as api from '../api/parkingApi';

type FeedbackType = 'granted' | 'denied' | 'error' | null;

// ── Label builders ────────────────────────────────────────────────────────────
function cardLabel(c: api.CardRow): string {
  const feeTag = c.role === 'FACULTY' ? 'fee-exempt' : c.status !== 'ACTIVE' ? c.status : c.role;
  return `${c.full_name} (${feeTag})`;
}
function gateLabel(g: api.GateRow): string {
  return `${g.gate_code}  (${g.zone_name} — ${g.direction})`;
}

export default function SimulatorPage() {
  // ── DB data state ──────────────────────────────────────────
  const [cards,        setCards]        = useState<api.CardRow[]>([]);
  const [gates,        setGates]        = useState<api.GateRow[]>([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [loadError,    setLoadError]    = useState<string | null>(null);

  // ── Selection state ────────────────────────────────────────
  const [cardUid,      setCardUid]      = useState('');
  const [gateId,       setGateId]       = useState('');

  const [loading,       setLoading]       = useState(false);
  const [feedback,      setFeedback]      = useState<{ type: FeedbackType; message: string } | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // ── RFID logs from DB ──────────────────────────────────────
  const [logs,        setLogs]        = useState<api.RfidLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError,   setLogsError]   = useState<string | null>(null);

  function refreshLogs() {
    setLogsLoading(true);
    api.getRfidLogs()
      .then(data => { setLogs(data); setLogsError(null); })
      .catch(err  => setLogsError((err as Error).message ?? 'Failed to load logs'))
      .finally(() => setLogsLoading(false));
  }

  // Load logs once on mount
  useEffect(() => { refreshLogs(); }, []);

  // ── Load cards + gates from DB on mount ───────────────────
  useEffect(() => {
    setLoadingData(true);
    Promise.all([api.getCards(), api.getGates()])
      .then(([c, g]) => {
        setCards(c);
        setGates(g);
        if (c.length) setCardUid(c[0].card_uid);
        if (g.length) setGateId(g[0].gate_id);
        setLoadError(null);
      })
      .catch(err => setLoadError((err as Error).message ?? 'Failed to load data'))
      .finally(() => setLoadingData(false));
  }, []);

  const selectedCard = cards.find(c => c.card_uid === cardUid);
  const selectedGate = gates.find(g => g.gate_id === gateId);

  // ── Feedback helpers ────────────────────────────────────────
  function showFeedback(type: FeedbackType, message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }

  // ── Ping health endpoint to detect if backend is running ────
  async function checkBackend() {
    try {
      const res = await fetch('http://localhost:3001/health');
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  }

  // ── UC-01 Entry ─────────────────────────────────────────────
  async function handleEntry() {
    setLoading(true);
    try {
      const data = await api.rfidEntry(cardUid, gateId);
      setBackendOnline(true);
      const type: FeedbackType = data.result === 'GRANTED' ? 'granted' : data.result === 'DENIED' ? 'denied' : 'error';
      showFeedback(type, data.message);
      refreshLogs();
    } catch (err: unknown) {
      setBackendOnline(false);
      const msg = err instanceof TypeError ? 'Cannot reach backend (is it running?)' : String((err as { message?: string }).message ?? err);
      showFeedback('error', msg);
    } finally {
      setLoading(false);
    }
  }

  // ── UC-01 Exit ──────────────────────────────────────────────
  async function handleExit() {
    setLoading(true);
    try {
      const data = await api.rfidExit(cardUid, gateId);
      setBackendOnline(true);
      const type: FeedbackType = data.result === 'GRANTED' ? 'granted' : data.result === 'DENIED' ? 'denied' : 'error';
      showFeedback(type, data.message);
      refreshLogs();
    } catch (err: unknown) {
      setBackendOnline(false);
      const msg = err instanceof TypeError ? 'Cannot reach backend (is it running?)' : String((err as { message?: string }).message ?? err);
      showFeedback('error', msg);
    } finally {
      setLoading(false);
    }
  }

  const entryGate = selectedGate?.direction === 'ENTRY' || selectedGate?.direction === 'BOTH';
  const exitGate  = selectedGate?.direction === 'EXIT'  || selectedGate?.direction === 'BOTH';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Controls ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-gray-900">RFID Gate Simulator</h2>
            </div>
            {/* Backend status indicator */}
            <button onClick={checkBackend} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Click to check backend connection">
              {backendOnline === null ? (
                <><Wifi className="w-3 h-3 text-gray-400" /><span className="text-gray-400">Check</span></>
              ) : backendOnline ? (
                <><Wifi className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 font-medium">Online</span></>
              ) : (
                <><WifiOff className="w-3 h-3 text-red-500" /><span className="text-red-600 font-medium">Offline</span></>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {/* Card UID */}
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">RFID Card</label>
              {loadingData ? (
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
              ) : loadError ? (
                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5" /> {loadError}
                </div>
              ) : (
                <select value={cardUid} onChange={e => setCardUid(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  {cards.map(c => (
                    <option key={c.card_uid} value={c.card_uid}>{cardLabel(c)}</option>
                  ))}
                </select>
              )}
              <p className="text-[10px] text-gray-400 mt-1 font-mono">UID: {cardUid}</p>
            </div>

            {/* Gate */}
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Gate</label>
              {loadingData ? (
                <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select value={gateId} onChange={e => setGateId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  {gates.map(g => (
                    <option key={g.gate_id} value={g.gate_id}>{gateLabel(g)}</option>
                  ))}
                </select>
              )}
              <p className="text-[10px] text-gray-400 mt-1 font-mono">{gateId}</p>
            </div>

            {/* Direction hint */}
            {selectedGate && (
              <div className={cn('rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2',
                entryGate ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700')}>
                {entryGate ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                {entryGate ? 'This is an ENTRY gate → use Entry button' : 'This is an EXIT gate → use Exit button'}
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={handleEntry} disabled={loading || !entryGate}
                className={cn('flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all',
                  !entryGate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                  loading    ? 'bg-purple-400 text-white cursor-wait' :
                               'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg')}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Entry
              </button>
              <button onClick={handleExit} disabled={loading || !exitGate}
                className={cn('flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all',
                  !exitGate  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                  loading    ? 'bg-emerald-400 text-white cursor-wait' :
                               'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg')}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Exit
              </button>
            </div>

            
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={cn('rounded-xl p-4 flex items-start gap-3',
                feedback.type === 'granted' ? 'bg-emerald-50 border border-emerald-200' :
                feedback.type === 'error'   ? 'bg-orange-50 border border-orange-200' :
                                              'bg-red-50 border border-red-200')}>
              {feedback.type === 'granted'
                ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <XCircle    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <p className={cn('text-sm font-medium',
                feedback.type === 'granted' ? 'text-emerald-800' :
                feedback.type === 'error'   ? 'text-orange-800' : 'text-red-800')}>
                {feedback.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RFID Access Log ── */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">RFID Access Log</h3>
            <p className="text-xs text-gray-400 mt-0.5">Live from <span className="font-mono">access_logs</span> · RFID events</p>
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
            <ScanLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No RFID events yet. Tap Entry or Exit to generate one.</p>
            <p className="text-xs mt-2 text-gray-300">Results are read directly from <span className="font-mono">access_logs</span>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold sticky top-0">
                <tr>
                  {['Time', 'Dir', 'Gate', 'Card / User', 'Role', 'Result', 'Reason'].map(h => (
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
                        {row.direction === 'ENTRY' ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                        {row.direction}
                      </span>
                    </td>
                    {/* Gate */}
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      <span className="font-medium">{row.gate_code}</span>
                      <span className="block text-[10px] text-gray-400">{row.zone_name}</span>
                    </td>
                    {/* Card / User */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className="font-mono text-gray-500">{row.card_uid ?? '—'}</span>
                      {row.full_name && (
                        <span className="block text-[10px] text-gray-400">{row.full_name}</span>
                      )}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      {row.role ? (
                        <span className={cn('px-2 py-0.5 rounded font-bold text-[10px]',
                          row.role === 'FACULTY' ? 'bg-amber-100 text-amber-700' :
                          row.role === 'STAFF'   ? 'bg-blue-100 text-blue-700' :
                                                   'bg-gray-100 text-gray-600')}>
                          {row.role}
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
