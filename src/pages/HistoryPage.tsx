import { useState, useMemo } from 'react';
import { Clock, Filter, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { LogCategory } from '../types';

const CAT_COLOR: Record<string, string> = {
  ENTRY_GRANTED: 'bg-emerald-100 text-emerald-700',
  ENTRY_DENIED: 'bg-red-100 text-red-700',
  EXIT_COMPLETED: 'bg-blue-100 text-blue-700',
  TEMP_TICKET_CREATED: 'bg-purple-100 text-purple-700',
  POLICY_UPDATED: 'bg-amber-100 text-amber-700',
  SYNC_COMPLETED: 'bg-cyan-100 text-cyan-700',
  SYNC_FAILED: 'bg-red-100 text-red-700',
  BILLING_GENERATED: 'bg-indigo-100 text-indigo-700',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-700',
  PAYMENT_RETRY: 'bg-orange-100 text-orange-700',
  DEVICE_FAULT: 'bg-red-100 text-red-700',
  ZONE_STATUS_CHANGED: 'bg-teal-100 text-teal-700',
  BARRIER_OVERRIDE: 'bg-pink-100 text-pink-700',
};

const CAT_LABEL: Partial<Record<LogCategory, string>> = {
  ENTRY_GRANTED: 'Entry: Granted',
  ENTRY_DENIED: 'Entry: Denied',
  EXIT_COMPLETED: 'Exit: Completed',
  TEMP_TICKET_CREATED: 'Temp Ticket',
  POLICY_UPDATED: 'Policy Updated',
  SYNC_COMPLETED: 'Sync OK',
  SYNC_FAILED: 'Sync Failed',
  BILLING_GENERATED: 'Billing',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_RETRY: 'Payment Retry',
  DEVICE_FAULT: 'Device Fault',
  ZONE_STATUS_CHANGED: 'Zone Changed',
  BARRIER_OVERRIDE: 'Manual Override',
};

const ALL_CATS: LogCategory[] = [
  'ENTRY_GRANTED', 'ENTRY_DENIED', 'EXIT_COMPLETED', 'TEMP_TICKET_CREATED',
  'POLICY_UPDATED', 'SYNC_COMPLETED', 'SYNC_FAILED', 'BILLING_GENERATED',
  'PAYMENT_PENDING', 'PAYMENT_RETRY', 'DEVICE_FAULT', 'ZONE_STATUS_CHANGED', 'BARRIER_OVERRIDE',
];

export default function HistoryPage() {
  const { state } = useAppStore();
  const { logs } = state;
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<LogCategory | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (filterCat !== 'ALL' && l.category !== filterCat) return false;
      if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.actor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, search, filterCat]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of logs) m[l.category] = (m[l.category] ?? 0) + 1;
    return m;
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Category Summary Chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCat('ALL')} className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-colors', filterCat === 'ALL' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
          All ({logs.length})
        </button>
        {ALL_CATS.filter(c => counts[c]).map(c => (
          <button key={c} onClick={() => setFilterCat(filterCat === c ? 'ALL' : c)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-colors', filterCat === c ? 'bg-purple-600 text-white' : cn('border', CAT_COLOR[c] ?? 'bg-gray-100 text-gray-600'))}>
            {CAT_LABEL[c] ?? c} 
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Find by keywords..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-lg">
          <Filter className="w-4 h-4" /> {filtered.length}  events
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>There are no events that match your query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold sticky top-0">
                <tr>
                  {['Time', 'Type', 'Actor', 'Content'].map(h => <th key={h} className="px-5 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap font-mono">{l.timestamp}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap', CAT_COLOR[l.category] ?? 'bg-gray-100 text-gray-600')}>
                        {CAT_LABEL[l.category] ?? l.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium whitespace-nowrap">{l.actor}</td>
                    <td className="px-5 py-3 text-gray-600">{l.message}</td>
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
