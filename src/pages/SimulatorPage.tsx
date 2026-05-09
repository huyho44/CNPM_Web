import { useState } from 'react';
import { ScanLine, LogIn, LogOut, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { User } from '../types';

type FeedbackType = 'granted' | 'denied' | 'exit' | null;

export default function SimulatorPage() {
  const { state, dispatch } = useAppStore();
  const { users, sessions } = state;
  const [selectedUserId, setSelectedUserId] = useState('U001');
  const [selectedGate, setSelectedGate] = useState('Cổng 1');
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);

  const selectedUser = users.find(u => u.id === selectedUserId) as User | undefined;
  const activeSession = sessions.find(s => s.userId === selectedUserId && s.status === 'Active');
  const userSessions = sessions.filter(s => s.userId === selectedUserId);

  const showFeedback = (type: FeedbackType, message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleEntry = () => {
    if (!selectedUser) return;
    if (selectedUser.status !== 'Active') {
      showFeedback('denied', `From gate: ${selectedGate} Account ${selectedUser.status === 'Suspended' ? 'Declined' : 'Revoked'}. Barie CLOSE.`);
    } else if (activeSession) {
      showFeedback('denied', 'This car is already in the parking lot. Cannot enter again.');
    } else {
      dispatch({ type: 'TAP_ENTRY', userId: selectedUserId, gateId: selectedGate });
      showFeedback('granted', `Successfully! Barie OPEN. Welcome ${selectedUser.name}.`);
    }
  };

  const handleExit = () => {
    if (!activeSession) {
      showFeedback('denied', 'No active session found. Barie CLOSE.');
      return;
    }
    dispatch({ type: 'TAP_EXIT', userId: selectedUserId });
    showFeedback('exit', `Successfully exit. Bye ${selectedUser.name}.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Controls */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <ScanLine className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900"> Choose user/card</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Choose user/card</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.cardId}) — {u.status !== 'Active' ? `${u.status}` : u.role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1.5">Choose gate</label>
              <select value={selectedGate} onChange={e => setSelectedGate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
                {['Gate 1 (LTK)', 'Gate 2 (THT)', 'Gate 3 (THT)'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* User Card */}
            {selectedUser && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-800">
                    {selectedUser.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{selectedUser.name}</p>
                    <p className="text-xs text-gray-500">{selectedUser.studentId} · {selectedUser.faculty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Role:</span> <span className="font-medium">{selectedUser.role}</span></div>
                  <div><span className="text-gray-400">Vehicle:</span> <span className="font-medium">{selectedUser.vehicleType}</span></div>
                  <div><span className="text-gray-400">License plate:</span> <span className="font-medium">{selectedUser.plateNumber}</span></div>
                  <div><span className="text-gray-400">Status:</span>{' '}
                    <span className={cn('font-bold', selectedUser.status === 'Active' ? 'text-emerald-600' : 'text-red-600')}>{selectedUser.status}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSession && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold text-blue-700">Active session</span>
                </div>
                <p>Entry: {activeSession.entryTime}</p>
                <p>Slot: {activeSession.slotId} · {activeSession.zoneName.split(' ').slice(0, 2).join(' ')}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={handleEntry} disabled={!!activeSession}
                className={cn('flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all', activeSession ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg')}>
                <LogIn className="w-4 h-4" /> Entry
              </button>
              <button onClick={handleExit} disabled={!activeSession}
                className={cn('flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all', !activeSession ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg')}>
                <LogOut className="w-4 h-4" /> Exit
              </button>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={cn('rounded-xl p-4 flex items-start gap-3', feedback.type === 'granted' ? 'bg-emerald-50 border border-emerald-200' : feedback.type === 'exit' ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200')}>
              {feedback.type === 'denied' ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
              <p className={cn('text-sm font-medium', feedback.type === 'denied' ? 'text-red-700' : 'text-emerald-700')}>{feedback.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session History */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">History — {selectedUser?.name ?? '—'}</h3>
        </div>
        {userSessions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ScanLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No sessions yet. Perform a card swipe to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  {['Status', 'Gate', 'Zone', 'Slot', 'Entry', 'Exit', 'Time', 'Fee'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {userSessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', s.status === 'Active' ? 'bg-blue-100 text-blue-700' : s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                        {s.status === 'Active' ? 'Active' : s.status === 'Completed' ? 'Completed' : 'Denied'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.gateId}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.zoneName.split(' ').slice(0,2).join(' ')}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.slotId ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.entryTime}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.exitTime ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.durationMinutes != null ? `${s.durationMinutes} phút` : '—'}</td>
                    <td className="px-4 py-3 font-bold text-purple-700">{s.fee != null ? `${s.fee.toLocaleString()} ₫` : '—'}</td>
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
