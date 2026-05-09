import { useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, RotateCcw, Power } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { ParkingStatus } from '../types';

const STATUS_COLOR: Record<ParkingStatus, string> = {
  Available: 'bg-emerald-500 hover:bg-emerald-400',
  Occupied: 'bg-red-500 hover:bg-red-400',
  Maintenance: 'bg-amber-500 hover:bg-amber-400',
};

export default function MonitoringPage() {
  const { state, dispatch } = useAppStore();
  const { slots, zones, devices } = state;
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');

  const visibleZones = selectedZoneId === 'all' ? zones : zones.filter(z => z.id === selectedZoneId);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedZoneId} onChange={e => setSelectedZoneId(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500">
          <option value="all">All zones</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <div className="flex items-center gap-4 text-xs ml-2">
          {(['Available', 'Occupied', 'Maintenance'] as ParkingStatus[]).map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', s === 'Available' ? 'bg-emerald-500' : s === 'Occupied' ? 'bg-red-500' : 'bg-amber-500')} />
              <span className="text-gray-600">{s === 'Available' ? 'Empty' : s === 'Occupied' ? 'Occupied' : 'Maintenance'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Grid */}
      {visibleZones.map(zone => {
        const zoneSlots = slots.filter(s => s.zone === zone.name);
        return (
          <div key={zone.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Zone Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900">{zone.name}</h3>
                {zone.gatewayConnected ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold',
                  zone.availability === 'Full' ? 'bg-red-100 text-red-700' :
                  zone.availability === 'Nearly Full' ? 'bg-amber-100 text-amber-700' :
                  zone.availability === 'Uncertain' ? 'bg-gray-100 text-gray-700' :
                  'bg-emerald-100 text-emerald-700')}>
                  {zone.availability === 'Available' ? 'Available' : zone.availability === 'Nearly Full' ? 'Nearly Full' : zone.availability === 'Full' ? 'Full' : 'Không xác định'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">💡 {zone.signageText}</span>
                <button onClick={() => dispatch({ type: 'TOGGLE_GATEWAY', zoneId: zone.id })}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    zone.gatewayConnected ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')}>
                  <Power className="w-3 h-3" />
                  {zone.gatewayConnected ? 'Disconnect Gateway' : 'Connect Gateway'}
                </button>
              </div>
            </div>

            {/* Slot Grid */}
            <div className="p-6">
              <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-1.5">
                {zoneSlots.map(slot => (
                  <motion.button
                    key={slot.id}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch({ type: 'TOGGLE_SLOT', slotId: slot.id })}
                    title={`${slot.id}: ${slot.status}`}
                    className={cn('aspect-square rounded text-[8px] font-bold text-white transition-colors', STATUS_COLOR[slot.status])}>
                    {slot.id.replace('S-', '')}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span> Empty: {zone.availableSlots}</span>
                <span> Occupied: {zone.occupiedSlots}</span>
                <span> Maintenance: {zone.maintenanceSlots}</span>
                <span className="text-gray-400">Click to change status</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Device Status Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Device Status</h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {devices.map(d => (
            <div key={d.id} className={cn('rounded-lg p-3 border', d.status === 'Online' ? 'border-emerald-200 bg-emerald-50' : d.status === 'Fault' ? 'border-red-200 bg-red-50' : d.status === 'Offline' ? 'border-gray-200 bg-gray-50' : 'border-amber-200 bg-amber-50')}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-700">{d.id}</span>
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold', d.status === 'Online' ? 'bg-emerald-200 text-emerald-800' : d.status === 'Fault' ? 'bg-red-200 text-red-800' : d.status === 'Offline' ? 'bg-gray-200 text-gray-800' : 'bg-amber-200 text-amber-800')}>
                  {d.status}
                </span>
              </div>
              <p className="text-xs text-gray-600">{d.type} · {d.zoneName.split(' ')[0]} {d.zoneName.split(' ')[1]}</p>
              <p className="text-[10px] text-gray-400 mt-1">Last: {d.lastHeartbeat}</p>
              {(d.status === 'Fault' || d.status === 'Offline') && (
                <div className="flex gap-1 mt-2">
                  <button onClick={() => dispatch({ type: 'RESTORE_DEVICE', deviceId: d.id })} className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors font-medium">
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                </div>
              )}
              {d.status === 'Online' && (
                <button onClick={() => dispatch({ type: 'TRIGGER_DEVICE_FAULT', deviceId: d.id })} className="mt-2 flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors font-medium">
                  <AlertTriangle className="w-3 h-3" /> Trigger fault
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
