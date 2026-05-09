import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  User, ParkingSlot, ZoneState, ParkingSession, PricingPolicy,
  BillingRecord, DeviceState, AuditLog, TemporaryTicket, Alert,
  TrafficPoint, SyncReport, ZoneAvailability, LogCategory,
} from '../types';
import {
  MOCK_USERS, INITIAL_SLOTS, ZONE_NAMES, ZONE_IDS,
  INITIAL_POLICIES, INITIAL_BILLING, INITIAL_DEVICES,
  INITIAL_LOGS, INITIAL_ALERTS, INITIAL_TICKETS, TRAFFIC_DATA,
} from '../mock/data';
import { DATACORE_USERS } from '../mock/datacore';

// ── Zone computation ──────────────────────────────────────────────────────────
function computeZones(slots: ParkingSlot[], prevZones: ZoneState[]): ZoneState[] {
  return ZONE_NAMES.map((name, i) => {
    const zSlots = slots.filter(s => s.zone === name);
    const available = zSlots.filter(s => s.status === 'Available').length;
    const occupied = zSlots.filter(s => s.status === 'Occupied').length;
    const maintenance = zSlots.filter(s => s.status === 'Maintenance').length;
    const total = zSlots.length;
    const prev = prevZones[i];
    const gwConnected = prev?.gatewayConnected ?? true;
    let availability: ZoneAvailability = 'Available';
    if (!gwConnected) availability = 'Uncertain';
    else if (available === 0) availability = 'Full';
    else if (available / total < 0.15) availability = 'Nearly Full';
    const signage = !gwConnected ? `${name.split(' ')[1]}: UNCERTAIN` :
      available === 0 ? `${name.split(' ')[1]}: FULL` :
        `${name.split(' ')[1]}: ${available} Empty`;
    return { id: ZONE_IDS[i], name, totalSlots: total, availableSlots: available, occupiedSlots: occupied, maintenanceSlots: maintenance, availability, signageText: signage, gatewayConnected: gwConnected };
  });
}

function findPolicy(policies: PricingPolicy[], user: User | null) {
  if (!user) return null;
  return policies.find(p => p.userType === user.role && p.vehicleType === user.vehicleType) ?? null;
}

function nowStr() {
  return new Date().toLocaleString('vi-VN', { hour12: false }).replace(',', '');
}
function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ── State ─────────────────────────────────────────────────────────────────────
export interface AppState {
  users: User[]; slots: ParkingSlot[]; zones: ZoneState[];
  sessions: ParkingSession[]; policies: PricingPolicy[];
  billingRecords: BillingRecord[]; devices: DeviceState[];
  logs: AuditLog[]; tickets: TemporaryTicket[]; alerts: Alert[];
  trafficData: TrafficPoint[]; lastSyncReport: SyncReport | null;
  simRunning: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────────
export type Action =
  | { type: 'TAP_ENTRY'; userId: string; gateId: string }
  | { type: 'TAP_EXIT'; userId: string }
  | { type: 'ISSUE_TICKET'; visitorName: string; vehicleType: import('../types').VehicleType; plateNumber: string; gateId: string }
  | { type: 'USE_TICKET'; ticketId: string }
  | { type: 'UPDATE_POLICY'; policy: PricingPolicy }
  | { type: 'ADD_POLICY'; policy: PricingPolicy }
  | { type: 'RUN_BILLING' }
  | { type: 'BKPAY_SIMULATE'; recordId: string; result: 'success' | 'timeout' | 'retry' }
  | { type: 'RUN_SYNC'; forceFailure?: boolean }
  | { type: 'TOGGLE_SLOT'; slotId: string }
  | { type: 'TOGGLE_GATEWAY'; zoneId: string }
  | { type: 'TRIGGER_DEVICE_FAULT'; deviceId: string }
  | { type: 'RESTORE_DEVICE'; deviceId: string }
  | { type: 'SIM_TICK' }
  | { type: 'RESET' }
  | { type: 'ADD_LOG'; log: Omit<AuditLog, 'id' | 'timestamp'> };

function addLog(logs: AuditLog[], entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog[] {
  return [{ id: makeId('L'), timestamp: nowStr(), ...entry }, ...logs].slice(0, 200);
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function initialState(): AppState {
  const slots = INITIAL_SLOTS;
  const zones = computeZones(slots, []);
  return {
    users: MOCK_USERS, slots, zones,
    sessions: [], policies: INITIAL_POLICIES,
    billingRecords: INITIAL_BILLING, devices: INITIAL_DEVICES,
    logs: INITIAL_LOGS, tickets: INITIAL_TICKETS,
    alerts: INITIAL_ALERTS, trafficData: TRAFFIC_DATA,
    lastSyncReport: null, simRunning: true,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'TAP_ENTRY': {
      const user = state.users.find(u => u.id === action.userId);
      if (!user) return state;

      // Check for existing active session
      const existing = state.sessions.find(s => s.userId === user.id && s.status === 'Active');
      if (existing) return state;

      // Validate user
      if (user.status !== 'Active') {
        const logs = addLog(state.logs, { category: 'ENTRY_DENIED', actor: user.name, message: `Từ chối vào ${action.gateId}. Lý do: Tài khoản ${user.status === 'Suspended' ? 'bị tạm khóa' : 'bị thu hồi'}.` });
        return { ...state, logs };
      }

      // Check zone restriction
      const policy = findPolicy(state.policies, user);
      const targetZone = state.zones.find(z => z.gatewayConnected && z.availableSlots > 0 && (!policy?.zoneRestriction || z.name === policy.zoneRestriction));
      if (!targetZone) {
        const logs = addLog(state.logs, { category: 'ENTRY_DENIED', actor: user.name, message: `Từ chối vào ${action.gateId}. Lý do: Không có chỗ trống phù hợp.` });
        return { ...state, logs };
      }

      // Assign slot
      const slot = state.slots.find(s => s.zone === targetZone.name && s.status === 'Available');
      const newSlots = state.slots.map(s => s.id === slot?.id ? { ...s, status: 'Occupied' as const } : s);
      const newZones = computeZones(newSlots, state.zones);

      const session: ParkingSession = {
        id: makeId('SES'), userId: user.id, userName: user.name, cardId: user.cardId,
        slotId: slot?.id ?? null, zoneName: targetZone.name, gateId: action.gateId,
        entryTime: nowStr(), exitTime: null, durationMinutes: null, fee: null,
        status: 'Active', isTemporary: false, ticketId: null,
      };
      const logs = addLog(state.logs, { category: 'ENTRY_GRANTED', actor: user.name, message: `Vào ${action.gateId}, slot ${slot?.id ?? 'N/A'} tại ${targetZone.name}. Xe: ${user.plateNumber}` });
      return { ...state, slots: newSlots, zones: newZones, sessions: [session, ...state.sessions], logs };
    }

    case 'TAP_EXIT': {
      const session = state.sessions.find(s => s.userId === action.userId && s.status === 'Active');
      if (!session) return state;
      const user = state.users.find(u => u.id === session.userId);
      const policy = findPolicy(state.policies, user ?? null);

      const entryMs = new Date(session.entryTime).getTime();
      const exitMs = Date.now();
      const durationMinutes = Math.max(1, Math.round((exitMs - entryMs) / 60000));

      let fee = 0;
      if (policy && !policy.exemption) {
        if (durationMinutes <= policy.freeEntryMinutes) {
          fee = 0;
        } else if (policy.rateType === 'PerTurn') {
          fee = policy.price;
        } else {
          fee = Math.ceil(durationMinutes / 60) * policy.price;
        }
      }

      const newSlots = state.slots.map(s => s.id === session.slotId ? { ...s, status: 'Available' as const } : s);
      const newZones = computeZones(newSlots, state.zones);
      const newSessions = state.sessions.map(s => s.id === session.id ? { ...s, exitTime: nowStr(), durationMinutes, fee, status: 'Completed' as const } : s);
      const logs = addLog(state.logs, { category: 'EXIT_COMPLETED', actor: session.userName, message: `Ra cổng, thời gian: ${durationMinutes} phút. Phí: ${fee.toLocaleString()} VNĐ. Slot ${session.slotId} giải phóng.` });
      return { ...state, slots: newSlots, zones: newZones, sessions: newSessions, logs };
    }

    case 'ISSUE_TICKET': {
      const id = makeId('TK');
      const ticketRef = `TKT-${Date.now().toString().slice(-5)}`;
      const now = new Date();
      const expires = new Date(now.getTime() + 12 * 3600000);
      const ticket: TemporaryTicket = {
        id, ticketRef, visitorName: action.visitorName, vehicleType: action.vehicleType,
        plateNumber: action.plateNumber, gateId: action.gateId,
        issuedAt: now.toLocaleString('vi-VN', { hour12: false }).replace(',', ''),
        expiresAt: expires.toLocaleString('vi-VN', { hour12: false }).replace(',', ''),
        status: 'Active',
      };
      // create a temporary session
      const targetZone = state.zones.find(z => z.gatewayConnected && z.availableSlots > 0);
      const slot = targetZone ? state.slots.find(s => s.zone === targetZone.name && s.status === 'Available') : null;
      const newSlots = slot ? state.slots.map(s => s.id === slot.id ? { ...s, status: 'Occupied' as const } : s) : state.slots;
      const newZones = computeZones(newSlots, state.zones);
      const session: ParkingSession = {
        id: makeId('SES'), userId: 'GUEST', userName: action.visitorName, cardId: ticketRef,
        slotId: slot?.id ?? null, zoneName: targetZone?.name ?? 'N/A', gateId: action.gateId,
        entryTime: nowStr(), exitTime: null, durationMinutes: null, fee: null,
        status: 'Active', isTemporary: true, ticketId: id,
      };
      const logs = addLog(state.logs, { category: 'TEMP_TICKET_CREATED', actor: 'Operator', message: `Vé tạm ${ticketRef} cấp cho ${action.visitorName}. Xe: ${action.plateNumber}` });
      return { ...state, slots: newSlots, zones: newZones, tickets: [ticket, ...state.tickets], sessions: [session, ...state.sessions], logs };
    }

    case 'USE_TICKET': {
      const newTickets = state.tickets.map(t => t.id === action.ticketId ? { ...t, status: 'Used' as const } : t);
      return { ...state, tickets: newTickets };
    }

    case 'UPDATE_POLICY': {
      const newPolicies = state.policies.map(p => p.id === action.policy.id ? action.policy : p);
      const logs = addLog(state.logs, { category: 'POLICY_UPDATED', actor: 'Admin', message: `Cập nhật chính sách ${action.policy.id}: ${action.policy.userType}/${action.policy.vehicleType} → ${action.policy.price.toLocaleString()} VNĐ/${action.policy.rateType === 'PerTurn' ? 'lượt' : 'giờ'}` });
      return { ...state, policies: newPolicies, logs };
    }

    case 'ADD_POLICY': {
      const logs = addLog(state.logs, { category: 'POLICY_UPDATED', actor: 'Admin', message: `Thêm chính sách mới: ${action.policy.userType}/${action.policy.vehicleType}` });
      return { ...state, policies: [...state.policies, action.policy], logs };
    }

    case 'RUN_BILLING': {
      const completedSessions = state.sessions.filter(s => s.status === 'Completed' && !s.isTemporary);
      const period = new Date().toISOString().slice(0, 7);
      const userMap = new Map<string, { count: number; amount: number; user: User }>();
      for (const s of completedSessions) {
        const user = state.users.find(u => u.id === s.userId);
        if (!user) continue;
        const cur = userMap.get(s.userId) ?? { count: 0, amount: 0, user };
        userMap.set(s.userId, { count: cur.count + 1, amount: cur.amount + (s.fee ?? 0), user });
      }
      const newRecords: BillingRecord[] = Array.from(userMap.values()).map(({ count, amount, user }) => ({
        id: makeId('B'), userId: user.id, userName: user.name, studentId: user.studentId,
        period, totalSessions: count, amount, status: 'Pending', bkpayRef: null,
        generatedAt: nowStr(), paidAt: null,
      }));
      const logs = addLog(state.logs, { category: 'BILLING_GENERATED', actor: 'Hệ thống', message: `Tạo ${newRecords.length} bản ghi thanh toán chu kỳ ${period}.` });
      return { ...state, billingRecords: [...newRecords, ...state.billingRecords], logs };
    }

    case 'BKPAY_SIMULATE': {
      let newRecords = state.billingRecords;
      let logEntry: Omit<AuditLog, 'id' | 'timestamp'>;
      if (action.result === 'success') {
        const ref = `BKP-${Date.now().toString().slice(-5)}`;
        newRecords = state.billingRecords.map(r => r.id === action.recordId ? { ...r, status: 'Paid' as const, bkpayRef: ref, paidAt: nowStr() } : r);
        logEntry = { category: 'BILLING_GENERATED', actor: 'BKPay', message: `Thanh toán thành công. Ref: ${ref}` };
      } else if (action.result === 'timeout') {
        newRecords = state.billingRecords.map(r => r.id === action.recordId ? { ...r, status: 'Pending' as const } : r);
        logEntry = { category: 'PAYMENT_PENDING', actor: 'BKPay', message: `BKPay không phản hồi. Bản ghi ${action.recordId} đang chờ.` };
      } else {
        newRecords = state.billingRecords.map(r => r.id === action.recordId ? { ...r, status: 'Retry' as const } : r);
        logEntry = { category: 'PAYMENT_RETRY', actor: 'BKPay', message: `BKPay yêu cầu thử lại. Bản ghi ${action.recordId}.` };
      }
      const logs = addLog(state.logs, logEntry);
      return { ...state, billingRecords: newRecords, logs };
    }

    case 'RUN_SYNC': {
      if (action.forceFailure) {
        const report: SyncReport = { id: makeId('SYNC'), timestamp: nowStr(), added: 0, updated: 0, revoked: 0, total: 0, failed: true, failureReason: 'DATACORE connection timeout after 30s', records: [] };
        const logs = addLog(state.logs, { category: 'SYNC_FAILED', actor: 'Hệ thống', message: 'Đồng bộ DATACORE thất bại: connection timeout.' });
        return { ...state, lastSyncReport: report, logs };
      }
      const localMap = new Map(state.users.map(u => [u.id, u]));
      const records = DATACORE_USERS.map(dc => {
        const local = localMap.get(dc.id);
        if (!local) return { userId: dc.id, name: dc.name, studentId: dc.studentId, role: dc.role, status: dc.status, changeType: 'Added' as const };
        if (local.status !== dc.status || local.faculty !== dc.faculty) return { userId: dc.id, name: dc.name, studentId: dc.studentId, role: dc.role, oldRole: local.role, status: dc.status, changeType: 'Updated' as const };
        return { userId: dc.id, name: dc.name, studentId: dc.studentId, role: dc.role, status: dc.status, changeType: 'Unchanged' as const };
      });
      const revoked = state.users.filter(u => !DATACORE_USERS.find(dc => dc.id === u.id)).map(u => ({ userId: u.id, name: u.name, studentId: u.studentId, role: u.role, status: 'Revoked' as const, changeType: 'Revoked' as const }));
      const allRecords = [...records, ...revoked];
      const added = allRecords.filter(r => r.changeType === 'Added').length;
      const updated = allRecords.filter(r => r.changeType === 'Updated').length;
      const revokedCount = allRecords.filter(r => r.changeType === 'Revoked').length;
      // Apply changes to local users
      let newUsers = [...state.users];
      for (const dc of DATACORE_USERS) {
        const idx = newUsers.findIndex(u => u.id === dc.id);
        if (idx === -1) newUsers.push(dc);
        else newUsers[idx] = { ...newUsers[idx], status: dc.status, faculty: dc.faculty };
      }
      const report: SyncReport = { id: makeId('SYNC'), timestamp: nowStr(), added, updated, revoked: revokedCount, total: allRecords.length, failed: false, records: allRecords };
      const logs = addLog(state.logs, { category: 'SYNC_COMPLETED', actor: 'Hệ thống', message: `Đồng bộ DATACORE: +${added} mới, ~${updated} cập nhật, -${revokedCount} thu hồi.` });
      return { ...state, users: newUsers, lastSyncReport: report, logs };
    }

    case 'TOGGLE_SLOT': {
      const newSlots = state.slots.map(s => {
        if (s.id !== action.slotId) return s;
        const next: Record<string, import('../types').ParkingStatus> = { Available: 'Occupied', Occupied: 'Available', Maintenance: 'Available' };
        return { ...s, status: next[s.status] as import('../types').ParkingStatus };
      });
      const newZones = computeZones(newSlots, state.zones);
      return { ...state, slots: newSlots, zones: newZones };
    }

    case 'TOGGLE_GATEWAY': {
      const newZones = state.zones.map(z => {
        if (z.id !== action.zoneId) return z;
        const gatewayConnected = !z.gatewayConnected;
        const availability: ZoneAvailability = gatewayConnected ? (z.availableSlots === 0 ? 'Full' : z.availableSlots / z.totalSlots < 0.15 ? 'Nearly Full' : 'Available') : 'Uncertain';
        const signage = gatewayConnected ? (z.availableSlots === 0 ? `${z.name.split(' ')[1]}: HẾT CHỖ` : `${z.name.split(' ')[1]}: Còn ${z.availableSlots} chỗ`) : `${z.name.split(' ')[1]}: KHÔNG XÁC ĐỊNH`;
        return { ...z, gatewayConnected, availability, signageText: signage };
      });
      const zone = state.zones.find(z => z.id === action.zoneId);
      const cat: LogCategory = 'ZONE_STATUS_CHANGED';
      const logs = addLog(state.logs, { category: cat, actor: 'Operator', message: `Gateway ${zone?.name} ${newZones.find(z => z.id === action.zoneId)?.gatewayConnected ? 'kết nối lại' : 'mất kết nối'}.` });
      return { ...state, zones: newZones, logs };
    }

    case 'TRIGGER_DEVICE_FAULT': {
      const newDevices = state.devices.map(d => d.id === action.deviceId ? { ...d, status: 'Fault' as const } : d);
      const dev = state.devices.find(d => d.id === action.deviceId);
      const logs = addLog(state.logs, { category: 'DEVICE_FAULT', actor: 'Hệ thống', message: `Thiết bị ${dev?.id} (${dev?.type}) tại ${dev?.zoneName} báo lỗi.` });
      return { ...state, devices: newDevices, logs };
    }

    case 'RESTORE_DEVICE': {
      const newDevices = state.devices.map(d => d.id === action.deviceId ? { ...d, status: 'Online' as const, lastHeartbeat: nowStr() } : d);
      return { ...state, devices: newDevices };
    }

    case 'SIM_TICK': {
      // Randomly toggle 1-2 slots
      const available = state.slots.filter(s => s.status !== 'Maintenance');
      if (available.length === 0) return state;
      const pick = available[Math.floor(Math.random() * available.length)];
      const newSlots = state.slots.map(s => s.id !== pick.id ? s : { ...s, status: s.status === 'Available' ? 'Occupied' as const : 'Available' as const });
      const newZones = computeZones(newSlots, state.zones);
      // Update traffic data slightly
      const now = new Date();
      const hourStr = `${String(now.getHours()).padStart(2, '0')}:00`;
      const newTraffic = state.trafficData.map(t => t.hour === hourStr ? { ...t, count: Math.max(0, t.count + Math.floor(Math.random() * 20) - 5) } : t);
      return { ...state, slots: newSlots, zones: newZones, trafficData: newTraffic };
    }

    case 'ADD_LOG': {
      const logs = addLog(state.logs, action.log);
      return { ...state, logs };
    }

    case 'RESET':
      return initialState();

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface ContextValue { state: AppState; dispatch: React.Dispatch<Action> }
const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Simulation loop
  useEffect(() => {
    if (!state.simRunning) return;
    const interval = setInterval(() => dispatch({ type: 'SIM_TICK' }), 4000);
    return () => clearInterval(interval);
  }, [state.simRunning]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be inside AppProvider');
  return ctx;
}
