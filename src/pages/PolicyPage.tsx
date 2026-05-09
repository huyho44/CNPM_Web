import { useState, type FC } from 'react';
import { Settings, Plus, Save, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { cn } from '../lib/utils';
import { PricingPolicy, UserRole, VehicleType } from '../types';

const ROLES: UserRole[] = ['Student', 'Staff', 'Guest'];
const VEHICLES: VehicleType[] = ['Motorbike', 'Bicycle', 'Car'];
const ROLE_LABEL: Record<UserRole, string> = { Student: 'Student', Staff: 'Staff', Guest: 'Guest' };
const VEH_LABEL: Record<VehicleType, string> = { Motorbike: 'Motorbike', Bicycle: 'Bicycle', Car: 'Car' };

interface PolicyCardProps { policy: PricingPolicy; onSave: (p: PricingPolicy) => void; }
const PolicyCard: FC<PolicyCardProps> = ({ policy, onSave }) => {
  const [edit, setEdit] = useState(policy);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(edit);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold mr-2', edit.userType === 'Student' ? 'bg-blue-100 text-blue-700' : edit.userType === 'Staff' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700')}>
            {ROLE_LABEL[edit.userType]}
          </span>
          <span className="text-xs text-gray-500">{VEH_LABEL[edit.vehicleType]}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">{edit.id}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Pricing Type</label>
          <select value={edit.rateType} onChange={e => setEdit(p => ({ ...p, rateType: e.target.value as 'PerTurn' | 'PerHour' }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500">
            <option value="PerTurn">PerTurn</option>
            <option value="PerHour">PerHour</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Price (VND)</label>
          <input type="number" value={edit.price} onChange={e => setEdit(p => ({ ...p, price: Number(e.target.value) }))}
            disabled={edit.exemption}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-40" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Free entry (minutes)</label>
          <input type="number" value={edit.freeEntryMinutes} onChange={e => setEdit(p => ({ ...p, freeEntryMinutes: Number(e.target.value) }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Zone restriction</label>
          <input value={edit.zoneRestriction ?? ''} onChange={e => setEdit(p => ({ ...p, zoneRestriction: e.target.value || null }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500" placeholder="All" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={edit.exemption} onChange={e => setEdit(p => ({ ...p, exemption: e.target.checked, price: e.target.checked ? 0 : p.price }))} className="rounded" />
        <span className="font-medium text-gray-700">Exemption</span>
      </label>

      <button onClick={handleSave}
        className={cn('w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all', saved ? 'bg-emerald-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700')}>
        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save</>}
      </button>
    </div>
  );
}

export default function PolicyPage() {
  const { state, dispatch } = useAppStore();
  const { policies } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Omit<PricingPolicy, 'id'>>({ userType: 'Student', vehicleType: 'Motorbike', rateType: 'PerTurn', price: 2000, exemption: false, freeEntryMinutes: 10, zoneRestriction: null });

  const handleSave = (policy: PricingPolicy) => dispatch({ type: 'UPDATE_POLICY', policy });
  const handleAdd = () => {
    dispatch({ type: 'ADD_POLICY', policy: { ...newPolicy, id: `P${Date.now()}` } });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Manage operating policies</h2>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Add policy
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Note:</strong> Changes policy will take effect immediately and affect all subsequent fee calculations. Staff members are exempted by default.
      </div>

      {/* Add New */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h3 className="font-bold text-purple-900 mb-4">Add new policy</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">User Type</label>
              <select value={newPolicy.userType} onChange={e => setNewPolicy(p => ({ ...p, userType: e.target.value as UserRole }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Vehicle Type</label>
              <select value={newPolicy.vehicleType} onChange={e => setNewPolicy(p => ({ ...p, vehicleType: e.target.value as VehicleType }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none">
                {VEHICLES.map(v => <option key={v} value={v}>{VEH_LABEL[v]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Pricing Type</label>
              <select value={newPolicy.rateType} onChange={e => setNewPolicy(p => ({ ...p, rateType: e.target.value as 'PerTurn' | 'PerHour' }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none">
                <option value="PerTurn">PerTurn</option>
                <option value="PerHour">PerHour</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Price (VNĐ)</label>
              <input type="number" value={newPolicy.price} onChange={e => setNewPolicy(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700"> Add</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {policies.map(p => <PolicyCard key={p.id} policy={p} onSave={handleSave} />)}
      </div>

      {/* Active Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Operating Hours & Zone Restriction</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Operating Hours</label>
            <div className="flex items-center gap-3">
              <input type="time" defaultValue="06:00" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="time" defaultValue="22:00" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">Effective Date</label>
            <input type="date" defaultValue="2026-05-01" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
