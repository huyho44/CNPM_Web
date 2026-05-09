import { useState } from 'react';
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle, Plus, Minus, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

const CHANGE_CONFIG = {
  Added: { icon: Plus, cls: 'bg-emerald-100 text-emerald-700', label: 'Add New' },
  Updated: { icon: Edit, cls: 'bg-blue-100 text-blue-700', label: 'Updated' },
  Revoked: { icon: Minus, cls: 'bg-red-100 text-red-700', label: 'Revoked' },
  Unchanged: { icon: CheckCircle, cls: 'bg-gray-100 text-gray-500', label: 'Unchanged' },
};

export default function SyncPage() {
  const { state, dispatch } = useAppStore();
  const { lastSyncReport, users } = state;
  const [syncing, setSyncing] = useState(false);
  const [forceFailure, setForceFailure] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1800));
    dispatch({ type: 'RUN_SYNC', forceFailure });
    setSyncing(false);
  };

  const changedRecords = lastSyncReport?.records.filter(r => r.changeType !== 'Unchanged') ?? [];

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-gray-900">Sync with HCMUT_DATACORE</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={forceFailure} onChange={e => setForceFailure(e.target.checked)} className="rounded" />
            <span className="text-gray-700">Timeout Simulation</span>
          </label>
          <button onClick={handleSync} disabled={syncing}
            className={cn('flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all', syncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg')}>
            <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
            {syncing ? 'Syncing...' : 'Sync now'}
          </button>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <strong>DATACORE Source:</strong> 12 users (2 new, 1 status update, 10 unchanged). The result will be displayed below after synchronization.
        </div>
      </div>

      {/* Sync Result */}
      <AnimatePresence>
        {lastSyncReport && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {lastSyncReport.failed ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Sync Failed</p>
                  <p className="text-sm text-red-600 mt-1">{lastSyncReport.failureReason}</p>
                  <p className="text-xs text-red-400 mt-2">{lastSyncReport.timestamp}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-800">Sync Successful — {lastSyncReport.timestamp}</span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div><span className="text-gray-500">New:</span> <span className="font-bold text-emerald-700">+{lastSyncReport.added}</span></div>
                    <div><span className="text-gray-500">Updated:</span> <span className="font-bold text-blue-700">~{lastSyncReport.updated}</span></div>
                    <div><span className="text-gray-500">Revoked:</span> <span className="font-bold text-red-700">-{lastSyncReport.revoked}</span></div>
                    <div><span className="text-gray-500">Total:</span> <span className="font-bold text-gray-700">{lastSyncReport.total}</span></div>
                  </div>
                </div>

                {/* Changed Records */}
                {changedRecords.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Detected changes ({changedRecords.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                          <tr>
                            {['Change', 'Name', 'Student ID', 'Role', 'Status'].map(h => <th key={h} className="px-5 py-3">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {changedRecords.map(r => {
                            const cfg = CHANGE_CONFIG[r.changeType];
                            return (
                              <tr key={r.userId} className="hover:bg-gray-50">
                                <td className="px-5 py-3">
                                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', cfg.cls)}>
                                    <cfg.icon className="w-3 h-3" /> {cfg.label}
                                  </span>
                                </td>
                                <td className="px-5 py-3 font-medium text-gray-900">{r.name}</td>
                                <td className="px-5 py-3 font-mono text-xs text-gray-500">{r.studentId}</td>
                                <td className="px-5 py-3 text-gray-600">
                                  {r.oldRole && r.oldRole !== r.role ? (
                                    <span>{r.oldRole} → <strong>{r.role}</strong></span>
                                  ) : r.role}
                                </td>
                                <td className="px-5 py-3">
                                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Revoked' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Current Users</h3>
          <span className="text-xs text-gray-400">{users.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                {['Name', 'ID', 'Card ID', 'Role', 'Faculty', 'Vehicle Type', 'Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.studentId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{u.cardId}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', u.role === 'Student' ? 'bg-blue-100 text-blue-700' : u.role === 'Staff' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{u.faculty}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{u.vehicleType} · {u.plateNumber}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold', u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : u.status === 'Suspended' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
