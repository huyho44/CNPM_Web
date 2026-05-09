import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ParkingCircle, Car, Wrench, Activity, Wifi, WifiOff, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';

const AVAIL_COLOR: Record<string, string> = {
  Available: 'bg-emerald-500 text-white',
  'Nearly Full': 'bg-amber-500 text-white',
  Full: 'bg-red-600 text-white',
  Uncertain: 'bg-gray-400 text-white',
};

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { state, dispatch } = useAppStore();
  const { slots, zones, sessions, devices, alerts, logs, trafficData } = state;

  const stats = useMemo(() => ({
    total: slots.length,
    available: slots.filter(s => s.status === 'Available').length,
    occupied: slots.filter(s => s.status === 'Occupied').length,
    maintenance: slots.filter(s => s.status === 'Maintenance').length,
    activeSessions: sessions.filter(s => s.status === 'Active').length,
    faults: devices.filter(d => d.status === 'Fault' || d.status === 'Offline').length,
  }), [slots, sessions, devices]);

  const scenarioButtons = [
    { label: 'Student in', action: () => dispatch({ type: 'TAP_ENTRY', userId: 'U001', gateId: 'Cổng 1' }) },
    { label: 'Student out', action: () => dispatch({ type: 'TAP_EXIT', userId: 'U001' }) },
    { label: 'A full', action: () => { state.slots.filter(s => s.zone === state.zones[0]?.name && s.status === 'Available').forEach(s => dispatch({ type: 'TOGGLE_SLOT', slotId: s.id })); } },
    { label: 'Sync DATACORE', action: () => dispatch({ type: 'RUN_SYNC' }) },
    { label: 'Run billing cycle', action: () => dispatch({ type: 'RUN_BILLING' }) },
    { label: 'Reset data', action: () => dispatch({ type: 'RESET' }) },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Scenarios */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-xl p-4">
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3">Demo Scenarios</p>
        <div className="flex flex-wrap gap-2">
          {scenarioButtons.map(b => (
            <button key={b.label} onClick={b.action} className="bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-white/20">
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Empty" value={stats.available} icon={ParkingCircle} color="bg-emerald-500" />
        <KpiCard label="Occupied" value={stats.occupied} icon={Car} color="bg-red-500" />
        <KpiCard label="Maintenance" value={stats.maintenance} icon={Wrench} color="bg-amber-500" />
        <KpiCard label="Active sessions" value={stats.activeSessions} icon={Activity} color="bg-blue-500" />
        <KpiCard label="Faults" value={stats.faults} icon={AlertTriangle} color={stats.faults > 0 ? 'bg-red-600' : 'bg-gray-400'} />
        <KpiCard label="Total slots" value={stats.total} icon={Zap} color="bg-purple-600" />
      </div>

      {/* Zone Signage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map(z => (
          <div key={z.id} className={cn('rounded-xl p-4 border-2', z.availability === 'Full' ? 'border-red-500 bg-red-50' : z.availability === 'Nearly Full' ? 'border-amber-400 bg-amber-50' : z.availability === 'Uncertain' ? 'border-gray-400 bg-gray-50' : 'border-emerald-400 bg-emerald-50')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600 uppercase">{z.name.split(' ')[0]} {z.name.split(' ')[1]}</span>
              {z.gatewayConnected ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-lg font-bold text-gray-900 truncate">{z.signageText}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{z.availableSlots} Empty</span>
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">{z.occupiedSlots} Occupied</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Number of cars by hour</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="hour" fontSize={11} tick={{ fill: '#9ca3af' }} />
                <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No alerts</p>}
            {alerts.map(a => (
              <div key={a.id} className={cn('p-3 rounded-lg border-l-4 text-sm', a.severity === 'High' ? 'border-red-500 bg-red-50' : a.severity === 'Medium' ? 'border-amber-400 bg-amber-50' : 'border-blue-400 bg-blue-50')}>
                <p className="font-medium text-gray-800">{a.message}</p>
                <p className="text-xs text-gray-500 mt-1">{a.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Recent Activity Logs</h3>
          <span className="text-xs text-gray-400">{logs.length} events</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
          {logs.slice(0, 8).map(l => (
            <div key={l.id} className="px-6 py-3 flex items-start gap-3">
              <span className={cn('mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap', l.category.includes('GRANTED') || l.category.includes('COMPLETED') ? 'bg-emerald-100 text-emerald-700' : l.category.includes('DENIED') || l.category.includes('FAULT') ? 'bg-red-100 text-red-700' : l.category.includes('SYNC') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700')}>
                {l.category.replace(/_/g, ' ')}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-gray-800 truncate">{l.message}</p>
                <p className="text-xs text-gray-400">{l.timestamp} · {l.actor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
