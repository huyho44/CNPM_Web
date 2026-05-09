import {
  User, ParkingSlot, PricingPolicy, BillingRecord,
  DeviceState, AuditLog, TemporaryTicket, Alert, TrafficPoint,
} from '../types';

export const ZONE_NAMES = [
  'Zone A (Gate 1 - Ly Thuong Kiet)',
  'Zone B (Gate 2 - To Hien Thanh)',
  'Zone C (Gate 3 - To Hien Thanh)',
];
export const ZONE_IDS = ['zone-a', 'zone-b', 'zone-c'];

export const MOCK_USERS: User[] = [
  { id: 'U001', name: 'Nguyen Van An', studentId: '2110001', cardId: 'CARD-001', role: 'Student', faculty: 'Computer Science & Engineering', vehicleType: 'Motorbike', plateNumber: '59A-123.45', status: 'Active', email: 'an.nguyen@hcmut.edu.vn' },
  { id: 'U002', name: 'Tran Thi Bich', studentId: '2110002', cardId: 'CARD-002', role: 'Student', faculty: 'Electronics & Telecommunications', vehicleType: 'Bicycle', plateNumber: '59B-678.90', status: 'Active', email: 'bich.tran@hcmut.edu.vn' },
  { id: 'U003', name: 'Le Hoang Cuong', studentId: '2110003', cardId: 'CARD-003', role: 'Student', faculty: 'Mechanical Engineering', vehicleType: 'Motorbike', plateNumber: '59C-111.22', status: 'Suspended', email: 'cuong.le@hcmut.edu.vn' },
  { id: 'U004', name: 'Pham Minh Dung', studentId: '2110004', cardId: 'CARD-004', role: 'Student', faculty: 'Civil Engineering', vehicleType: 'Motorbike', plateNumber: '59D-333.44', status: 'Active', email: 'dung.pham@hcmut.edu.vn' },
  { id: 'U005', name: 'Hoang Thu Ha', studentId: '2110005', cardId: 'CARD-005', role: 'Student', faculty: 'Industrial Management', vehicleType: 'Car', plateNumber: '59E-555.66', status: 'Active', email: 'ha.hoang@hcmut.edu.vn' },
  { id: 'U006', name: 'GS. Vo Trung Phong', studentId: 'STAFF-001', cardId: 'CARD-006', role: 'Staff', faculty: 'Computer Science & Engineering', vehicleType: 'Car', plateNumber: '51H-999.00', status: 'Active', email: 'phong.vo@hcmut.edu.vn' },
  { id: 'U007', name: 'ThS. Nguyen Lan Anh', studentId: 'STAFF-002', cardId: 'CARD-007', role: 'Staff', faculty: 'Electronics & Telecommunications', vehicleType: 'Motorbike', plateNumber: '51G-777.88', status: 'Active', email: 'lananh.nguyen@hcmut.edu.vn' },
  { id: 'U008', name: 'TS. Dang Quoc Hung', studentId: 'STAFF-003', cardId: 'CARD-008', role: 'Staff', faculty: 'Mechanical Engineering', vehicleType: 'Car', plateNumber: '51F-111.22', status: 'Active', email: 'hung.dang@hcmut.edu.vn' },
  { id: 'U009', name: 'Bui Thi Kim Yen', studentId: '2110009', cardId: 'CARD-009', role: 'Student', faculty: 'Chemical Engineering & Food Technology', vehicleType: 'Bicycle', plateNumber: '59F-222.33', status: 'Active', email: 'yen.bui@hcmut.edu.vn' },
  { id: 'U010', name: 'Do Minh Tuan', studentId: '2110010', cardId: 'CARD-010', role: 'Student', faculty: 'Computer Science & Engineering', vehicleType: 'Motorbike', plateNumber: '59G-444.55', status: 'Active', email: 'tuan.do@hcmut.edu.vn' },
];

export const INITIAL_SLOTS: ParkingSlot[] = Array.from({ length: 200 }).map((_, i) => {
  let zone = ZONE_NAMES[0];
  if (i >= 80 && i < 140) zone = ZONE_NAMES[1];
  if (i >= 140) zone = ZONE_NAMES[2];
  const r = Math.random();
  const status = r > 0.65 ? 'Occupied' : r > 0.55 ? 'Maintenance' : 'Available';
  return { id: `S-${i + 1}`, status, zone, coordinate: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 } };
});

export const INITIAL_POLICIES: PricingPolicy[] = [
  { id: 'P001', userType: 'Student', vehicleType: 'Motorbike', rateType: 'PerTurn', price: 2000, exemption: false, freeEntryMinutes: 10, zoneRestriction: null },
  { id: 'P002', userType: 'Student', vehicleType: 'Bicycle', rateType: 'PerTurn', price: 1000, exemption: false, freeEntryMinutes: 10, zoneRestriction: null },
  { id: 'P003', userType: 'Student', vehicleType: 'Car', rateType: 'PerHour', price: 5000, exemption: false, freeEntryMinutes: 10, zoneRestriction: 'Bãi B (Cổng 2 - Tô Hiến Thành)' },
  { id: 'P004', userType: 'Staff', vehicleType: 'Motorbike', rateType: 'PerTurn', price: 0, exemption: true, freeEntryMinutes: 0, zoneRestriction: null },
  { id: 'P005', userType: 'Staff', vehicleType: 'Car', rateType: 'PerTurn', price: 0, exemption: true, freeEntryMinutes: 0, zoneRestriction: null },
  { id: 'P006', userType: 'Guest', vehicleType: 'Motorbike', rateType: 'PerTurn', price: 5000, exemption: false, freeEntryMinutes: 0, zoneRestriction: null },
];

export const INITIAL_BILLING: BillingRecord[] = [
  { id: 'B001', userId: 'U001', userName: 'Nguyen Van An', studentId: '2110001', period: '2026-04', totalSessions: 22, amount: 44000, status: 'Paid', bkpayRef: 'BKP-00123', generatedAt: '2026-04-30 23:00', paidAt: '2026-05-01 08:00' },
  { id: 'B002', userId: 'U002', userName: 'Tran Thi Bich', studentId: '2110002', period: '2026-04', totalSessions: 18, amount: 18000, status: 'Paid', bkpayRef: 'BKP-00124', generatedAt: '2026-04-30 23:00', paidAt: '2026-05-01 09:30' },
  { id: 'B003', userId: 'U003', userName: 'Le Hoang Cuong', studentId: '2110003', period: '2026-04', totalSessions: 10, amount: 20000, status: 'Debt', bkpayRef: null, generatedAt: '2026-04-30 23:00', paidAt: null },
  { id: 'B004', userId: 'U004', userName: 'Pham Minh Dung', studentId: '2110004', period: '2026-04', totalSessions: 20, amount: 40000, status: 'Pending', bkpayRef: null, generatedAt: '2026-04-30 23:00', paidAt: null },
  { id: 'B005', userId: 'U009', userName: 'Bui Thi Kim Yen', studentId: '2110009', period: '2026-04', totalSessions: 15, amount: 15000, status: 'Retry', bkpayRef: null, generatedAt: '2026-04-30 23:00', paidAt: null },
  { id: 'B006', userId: 'U010', userName: 'Do Minh Tuan', studentId: '2110010', period: '2026-04', totalSessions: 25, amount: 50000, status: 'Paid', bkpayRef: 'BKP-00125', generatedAt: '2026-04-30 23:00', paidAt: '2026-05-02 10:00' },
];

export const INITIAL_DEVICES: DeviceState[] = [
  { id: 'DEV-A-GW', type: 'Gateway', zoneId: 'zone-a', zoneName: ZONE_NAMES[0], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
  { id: 'DEV-A-SNS', type: 'Sensor', zoneId: 'zone-a', zoneName: ZONE_NAMES[0], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
  { id: 'DEV-A-BAR', type: 'Barrier', zoneId: 'zone-a', zoneName: ZONE_NAMES[0], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
  { id: 'DEV-A-LED', type: 'LED', zoneId: 'zone-a', zoneName: ZONE_NAMES[0], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
  { id: 'DEV-B-GW', type: 'Gateway', zoneId: 'zone-b', zoneName: ZONE_NAMES[1], status: 'Offline', lastHeartbeat: '2026-05-09 07:20' },
  { id: 'DEV-B-SNS', type: 'Sensor', zoneId: 'zone-b', zoneName: ZONE_NAMES[1], status: 'Fault', lastHeartbeat: '2026-05-09 07:15' },
  { id: 'DEV-B-BAR', type: 'Barrier', zoneId: 'zone-b', zoneName: ZONE_NAMES[1], status: 'Online', lastHeartbeat: '2026-05-09 11:57' },
  { id: 'DEV-B-LED', type: 'LED', zoneId: 'zone-b', zoneName: ZONE_NAMES[1], status: 'Online', lastHeartbeat: '2026-05-09 11:57' },
  { id: 'DEV-C-GW', type: 'Gateway', zoneId: 'zone-c', zoneName: ZONE_NAMES[2], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
  { id: 'DEV-C-SNS', type: 'Sensor', zoneId: 'zone-c', zoneName: ZONE_NAMES[2], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
  { id: 'DEV-C-BAR', type: 'Barrier', zoneId: 'zone-c', zoneName: ZONE_NAMES[2], status: 'Maintenance', lastHeartbeat: '2026-05-09 09:00' },
  { id: 'DEV-C-LED', type: 'LED', zoneId: 'zone-c', zoneName: ZONE_NAMES[2], status: 'Online', lastHeartbeat: '2026-05-09 11:58' },
];

export const INITIAL_LOGS: AuditLog[] = [
  { id: 'L001', timestamp: '2026-05-09 06:00', category: 'ENTRY_GRANTED', actor: 'Nguyen Van An', message: 'Gate 1, slot S-5 assigned. Vehicle: 59A-123.45' },
  { id: 'L002', timestamp: '2026-05-09 06:45', category: 'ENTRY_GRANTED', actor: 'GS. Vo Trung Phong', message: 'Gate 2, slot S-95 assigned. Free entry (Staff).' },
  { id: 'L003', timestamp: '2026-05-09 07:00', category: 'ENTRY_DENIED', actor: 'Le Hoang Cuong', message: 'Gate 1 entry denied. Reason: Account suspended.' },
  { id: 'L004', timestamp: '2026-05-09 07:15', category: 'DEVICE_FAULT', actor: 'System', message: 'Sensor DEV-B-SNS error at Zone B.' },
  { id: 'L005', timestamp: '2026-05-09 07:20', category: 'DEVICE_FAULT', actor: 'System', message: 'Gateway DEV-B-GW lost connection at Zone B.' },
  { id: 'L006', timestamp: '2026-05-09 07:25', category: 'ENTRY_GRANTED', actor: 'Tran Thi Bich', message: 'Gate 1, slot S-22 assigned. Bicycle.' },
  { id: 'L007', timestamp: '2026-05-09 08:00', category: 'TEMP_TICKET_CREATED', actor: 'Operator', message: 'Temp ticket TKT-00001 issued to visitor. Plate: 59X-999.00' },
  { id: 'L008', timestamp: '2026-05-09 08:30', category: 'ZONE_STATUS_CHANGED', actor: 'System', message: 'Zone A changed to "Nearly Full" (8 slots left).' },
  { id: 'L009', timestamp: '2026-05-09 09:00', category: 'POLICY_UPDATED', actor: 'Admin', message: 'Updated student motorbike fee: 2000 → 2500 VNĐ/turn.' },
  { id: 'L010', timestamp: '2026-05-09 09:30', category: 'EXIT_COMPLETED', actor: 'Nguyen Van An', message: 'Exit gate 1. Time: 3.5h. Fee: 2000 VNĐ.' },
  { id: 'L011', timestamp: '2026-05-09 10:00', category: 'SYNC_COMPLETED', actor: 'System', message: 'Sync DATACORE: +2 new, ~1 update, 0 revoked.' },
  { id: 'L012', timestamp: '2026-05-09 10:30', category: 'BILLING_GENERATED', actor: 'System', message: 'Generated 6 billing records for April 2026.' },
  { id: 'L013', timestamp: '2026-05-09 11:00', category: 'PAYMENT_PENDING', actor: 'BKPay', message: 'Payment request B005 pending. BKPay has not responded.' },
  { id: 'L014', timestamp: '2026-05-09 11:30', category: 'BARRIER_OVERRIDE', actor: 'Admin', message: 'Manually opened gate 3 due to sensor failure.' },
];

export const INITIAL_ALERTS: Alert[] = [
  { id: 'A001', type: 'Sensor', message: 'Sensor fault at slot B-12 (DEV-B-SNS)', timestamp: '2026-05-09 07:15', severity: 'Medium' },
  { id: 'A002', type: 'Gateway', message: 'Gateway Zone B lost connection (DEV-B-GW)', timestamp: '2026-05-09 07:20', severity: 'High' },
  { id: 'A003', type: 'Auth', message: 'Card swipe failed: U003 (Account suspended)', timestamp: '2026-05-09 07:00', severity: 'Low' },
];

export const INITIAL_TICKETS: TemporaryTicket[] = [
  { id: 'TK001', ticketRef: 'TKT-00001', visitorName: 'Visitor', vehicleType: 'Motorbike', plateNumber: '59X-999.00', gateId: 'Gate 1', issuedAt: '2026-05-09 08:00', expiresAt: '2026-05-09 20:00', status: 'Active' },
];

export const TRAFFIC_DATA: TrafficPoint[] = [
  { hour: '06:00', count: 120 }, { hour: '07:00', count: 450 }, { hour: '08:00', count: 580 },
  { hour: '09:00', count: 320 }, { hour: '10:00', count: 210 }, { hour: '11:00', count: 400 },
  { hour: '12:00', count: 350 }, { hour: '13:00', count: 280 }, { hour: '14:00', count: 310 },
  { hour: '15:00', count: 420 }, { hour: '16:00', count: 550 }, { hour: '17:00', count: 620 },
];
