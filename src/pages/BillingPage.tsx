import { useState } from 'react';
import { CreditCard, RefreshCw, Download, Send, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { BillingStatus } from '../types';

const STATUS_CONFIG: Record<BillingStatus, { label: string; cls: string }> = {
  Paid: { label: 'Đã thanh toán', cls: 'bg-emerald-100 text-emerald-700' },
  Pending: { label: 'Chờ xử lý', cls: 'bg-blue-100 text-blue-700' },
  Debt: { label: 'Nợ', cls: 'bg-red-100 text-red-700' },
  Retry: { label: 'Cần thử lại', cls: 'bg-amber-100 text-amber-700' },
};

export default function BillingPage() {
  const { state, dispatch } = useAppStore();
  const { billingRecords, sessions } = state;
  const [processing, setProcessing] = useState<string | null>(null);

  const totalRevenue = billingRecords.filter(r => r.status === 'Paid').reduce((a, r) => a + r.amount, 0);
  const pendingAmount = billingRecords.filter(r => r.status !== 'Paid').reduce((a, r) => a + r.amount, 0);

  const simulate = async (recordId: string, result: 'success' | 'timeout' | 'retry') => {
    setProcessing(recordId);
    await new Promise(r => setTimeout(r, 1200));
    dispatch({ type: 'BKPAY_SIMULATE', recordId, result });
    setProcessing(null);
  };

  const completedSessions = sessions.filter(s => s.status === 'Completed' && !s.isTemporary);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total revenue', value: `${totalRevenue.toLocaleString()} ₫`, cls: 'bg-emerald-500', icon: CheckCircle },
          { label: 'Pending ', value: `${pendingAmount.toLocaleString()} ₫`, cls: 'bg-amber-500', icon: Clock },
          { label: 'Record', value: billingRecords.length, cls: 'bg-purple-600', icon: CreditCard },
          { label: 'Completed sessions', value: completedSessions.length, cls: 'bg-blue-500', icon: RefreshCw },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', c.cls)}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => dispatch({ type: 'RUN_BILLING' })}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Run billing cycle
        </button>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">List of accumulated payments</h3>
          <span className="text-xs text-gray-400">{billingRecords.length} records</span>
        </div>
        {billingRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>There are no records. Run the billing cycle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  {['Student', 'Period', 'Session', 'Amount', 'Status', 'BKPay Ref', 'Created At', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {billingRecords.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.userName}</p>
                      <p className="text-xs text-gray-400">{r.studentId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.period}</td>
                    <td className="px-4 py-3 text-gray-600">{r.totalSessions}</td>
                    <td className="px-4 py-3 font-bold text-purple-800">{r.amount.toLocaleString()} ₫</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', STATUS_CONFIG[r.status].cls)}>
                        {STATUS_CONFIG[r.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.bkpayRef ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{r.generatedAt}</td>
                    <td className="px-4 py-3">
                      {r.status !== 'Paid' && (
                        <div className="flex gap-1 flex-wrap">
                          <AnimatePresence>
                            {processing === r.id ? (
                              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-500 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                              </motion.span>
                            ) : (
                              <>
                                <button onClick={() => simulate(r.id, 'success')} className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 font-medium whitespace-nowrap">
                                  <CheckCircle className="w-3 h-3" /> OK
                                </button>
                                <button onClick={() => simulate(r.id, 'timeout')} className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 font-medium whitespace-nowrap">
                                  <Clock className="w-3 h-3" /> Timeout
                                </button>
                                <button onClick={() => simulate(r.id, 'retry')} className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-medium whitespace-nowrap">
                                  <AlertTriangle className="w-3 h-3" /> Retry
                                </button>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
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
