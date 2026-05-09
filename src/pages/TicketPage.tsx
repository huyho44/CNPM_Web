import { useState } from 'react';
import { Ticket, Printer, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { VehicleType } from '../types';

export default function TicketPage() {
  const { state, dispatch } = useAppStore();
  const { tickets } = state;
  const [form, setForm] = useState({ visitorName: 'Guest', vehicleType: 'Motorbike' as VehicleType, plateNumber: '', gateId: 'Gate 1 (LTK)' });
  const [printerFail, setPrinterFail] = useState(false);
  const [barrierFail, setBarrierFail] = useState(false);
  const [lastTicket, setLastTicket] = useState<typeof tickets[0] | null>(null);
  const [copied, setCopied] = useState(false);

  const handleIssue = () => {
    if (printerFail) { alert('Printer Error: Cannot print ticket. Please check the printer.'); return; }
    if (barrierFail) { alert('Barrier Error: Barrier is stuck. Manual intervention is required.'); return; }
    if (!form.plateNumber.trim()) { alert('Please enter the license plate.'); return; }
    dispatch({ type: 'ISSUE_TICKET', ...form });
    // find the newest ticket after dispatch
    setTimeout(() => {
      setLastTicket(state.tickets[0] ?? null);
    }, 100);
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const activeTickets = tickets.filter(t => t.status === 'Active');
  const usedTickets = tickets.filter(t => t.status !== 'Active');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Issuance Form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Ticket className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900">Issue Temporary Ticket (UC-02)</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Guest Name</label>
              <input value={form.visitorName} onChange={e => setForm(f => ({ ...f, visitorName: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Guest name" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">License Plate</label>
              <input value={form.plateNumber} onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ex: 59X-123.45" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Vehicle Type</label>
                <select value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value as VehicleType }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="Motorbike">Motorbike</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Car">Car</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1.5">Gate</label>
                <select value={form.gateId} onChange={e => setForm(f => ({ ...f, gateId: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                  {['Gate 1 (LTK)', 'Gate 2 (THT)', 'Gate 3 (THT)'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Failure toggles */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Simulate Failure</p>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={printerFail} onChange={e => setPrinterFail(e.target.checked)} className="rounded" />
                <Printer className="w-3.5 h-3.5" /> Printer Error
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input type="checkbox" checked={barrierFail} onChange={e => setBarrierFail(e.target.checked)} className="rounded" />
                 Barrier Error
              </label>
            </div>

            <button onClick={handleIssue}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" /> Issue Temporary Ticket
            </button>
          </div>
        </div>

        {/* Last ticket preview */}
        <AnimatePresence>
          {tickets.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-xl border-2 border-dashed border-purple-300 p-5">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Lastest Ticket
              </p>
              {(() => {
                const t = tickets[0];
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-lg text-purple-800">{t.ticketRef}</span>
                      <button onClick={() => copyRef(t.ticketRef)} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
                        <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>👤 {t.visitorName}</p>
                      <p>🚗 {t.plateNumber} ({t.vehicleType})</p>
                      <p>🚪 {t.gateId}</p>
                      <p>⏱ {t.issuedAt} → {t.expiresAt}</p>
                    </div>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold', t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>{t.status}</span>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tickets Table */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Ticket List</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">{activeTickets.length} Active</span>
        </div>
        {tickets.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No tickets have been issued.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  {['Ticket Ref', 'Name', 'Plate Number', 'Gate', 'Issued At', 'Expires At', 'Status', ''].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700">{t.ticketRef}</td>
                    <td className="px-4 py-3">{t.visitorName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.plateNumber}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.gateId}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.issuedAt}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{t.expiresAt}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : t.status === 'Used' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600')}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {t.status === 'Active' && (
                        <button onClick={() => dispatch({ type: 'USE_TICKET', ticketId: t.id })} className="text-xs text-purple-600 hover:underline font-medium">Use Ticket</button>
                      )}
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
