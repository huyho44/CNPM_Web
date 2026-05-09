// ── Parking ───────────────────────────────────────────────────────────────────
export type ParkingStatus = 'Available' | 'Occupied' | 'Maintenance';
export interface ParkingSlot {
  id: string; status: ParkingStatus; zone: string;
  coordinate: { x: number; y: number };
}

// ── Users ─────────────────────────────────────────────────────────────────────
export type UserRole = 'Student' | 'Staff' | 'Guest';
export type VehicleType = 'Bicycle' | 'Motorbike' | 'Car';
export type UserStatus = 'Active' | 'Suspended' | 'Revoked';
export interface User {
  id: string; name: string; studentId: string; cardId: string;
  role: UserRole; faculty: string; vehicleType: VehicleType;
  plateNumber: string; status: UserStatus; email: string;
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export interface ParkingSession {
  id: string; userId: string; userName: string; cardId: string;
  slotId: string | null; zoneName: string; gateId: string;
  entryTime: string; exitTime: string | null;
  durationMinutes: number | null; fee: number | null;
  status: 'Active' | 'Completed' | 'Denied';
  isTemporary: boolean; ticketId: string | null;
}

// ── Policies ──────────────────────────────────────────────────────────────────
export interface PricingPolicy {
  id: string; userType: UserRole; vehicleType: VehicleType;
  rateType: 'PerTurn' | 'PerHour'; price: number;
  exemption: boolean; freeEntryMinutes: number; zoneRestriction: string | null;
}

// ── Billing ───────────────────────────────────────────────────────────────────
export type BillingStatus = 'Paid' | 'Pending' | 'Debt' | 'Retry';
export interface BillingRecord {
  id: string; userId: string; userName: string; studentId: string;
  period: string; totalSessions: number; amount: number;
  status: BillingStatus; bkpayRef: string | null;
  generatedAt: string; paidAt: string | null;
}

// ── Devices ───────────────────────────────────────────────────────────────────
export type DeviceType = 'Sensor' | 'Gateway' | 'Barrier' | 'LED' | 'Camera';
export type DeviceStatus = 'Online' | 'Offline' | 'Fault' | 'Maintenance';
export interface DeviceState {
  id: string; type: DeviceType; zoneId: string; zoneName: string;
  status: DeviceStatus; lastHeartbeat: string;
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export type LogCategory =
  | 'ENTRY_GRANTED' | 'ENTRY_DENIED' | 'EXIT_COMPLETED'
  | 'TEMP_TICKET_CREATED' | 'POLICY_UPDATED'
  | 'SYNC_COMPLETED' | 'SYNC_FAILED'
  | 'BILLING_GENERATED' | 'PAYMENT_PENDING' | 'PAYMENT_RETRY'
  | 'DEVICE_FAULT' | 'ZONE_STATUS_CHANGED' | 'BARRIER_OVERRIDE';

export interface AuditLog {
  id: string; timestamp: string; category: LogCategory;
  actor: string; message: string;
}

// ── Tickets ───────────────────────────────────────────────────────────────────
export interface TemporaryTicket {
  id: string; ticketRef: string; visitorName: string;
  vehicleType: VehicleType; plateNumber: string;
  gateId: string; issuedAt: string; expiresAt: string;
  status: 'Active' | 'Used' | 'Expired';
}

// ── Zones ─────────────────────────────────────────────────────────────────────
export type ZoneAvailability = 'Available' | 'Nearly Full' | 'Full' | 'Uncertain';
export interface ZoneState {
  id: string; name: string; totalSlots: number;
  availableSlots: number; occupiedSlots: number; maintenanceSlots: number;
  availability: ZoneAvailability; signageText: string; gatewayConnected: boolean;
}

// ── Sync ──────────────────────────────────────────────────────────────────────
export interface SyncRecord {
  userId: string; name: string; studentId: string;
  role: UserRole; oldRole?: UserRole; status: UserStatus;
  changeType: 'Added' | 'Updated' | 'Revoked' | 'Unchanged';
}
export interface SyncReport {
  id: string; timestamp: string;
  added: number; updated: number; revoked: number; total: number;
  failed: boolean; failureReason?: string; records: SyncRecord[];
}

// ── Alerts & Traffic ──────────────────────────────────────────────────────────
export interface Alert {
  id: string; type: 'Sensor' | 'Gateway' | 'Auth' | 'System';
  message: string; timestamp: string; severity: 'Low' | 'Medium' | 'High';
}
export interface TrafficPoint { hour: string; count: number; }
