import { ParkingSlot, Alert, PricingPolicy, Transaction, UserRecord } from './types';

export const ZONES = [
  'Bãi A (Cổng 1 - Lý Thường Kiệt)', 
  'Bãi B (Cổng 2 - Tô Hiến Thành)', 
  'Bãi C (Cổng 3 - Tô Hiến Thành)'
];

export const MOCK_SLOTS: ParkingSlot[] = Array.from({ length: 200 }).map((_, i) => {
  let zone = ZONES[0];
  if (i >= 80 && i < 140) zone = ZONES[1];
  if (i >= 140) zone = ZONES[2];
  
  return {
    id: `S-${i + 1}`,
    status: Math.random() > 0.7 ? 'Occupied' : Math.random() > 0.9 ? 'Maintenance' : 'Available',
    zone,
    coordinate: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
  };
});

export const MOCK_ALERTS: Alert[] = [
  { id: '1', type: 'Sensor', message: 'Lỗi cảm biến tại ô A-12', timestamp: '2026-04-02 07:15', severity: 'Medium' },
  { id: '2', type: 'Gateway', message: 'Gateway khu vực B mất kết nối', timestamp: '2026-04-02 07:20', severity: 'High' },
  { id: '3', type: 'Auth', message: 'Quẹt thẻ không thành công: 2110123', timestamp: '2026-04-02 07:25', severity: 'Low' },
];

export const MOCK_POLICIES: PricingPolicy[] = [
  { id: '1', userType: 'Student', pricePerTurn: 2000, pricePerHour: 1000, effectiveDate: '2026-01-01' },
  { id: '2', userType: 'Staff', pricePerTurn: 1000, pricePerHour: 500, effectiveDate: '2026-01-01' },
  { id: '3', userType: 'Guest', pricePerTurn: 5000, pricePerHour: 2000, effectiveDate: '2026-01-01' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'T1', studentId: '2110123', plateNumber: '59A-123.45', amount: 2000, status: 'Paid', timestamp: '2026-04-02 07:00' },
  { id: 'T2', studentId: '2110456', plateNumber: '59B-678.90', amount: 4000, status: 'Debt', timestamp: '2026-04-02 06:45' },
  { id: 'T3', studentId: '2110789', plateNumber: '59C-111.22', amount: 2000, status: 'Pending', timestamp: '2026-04-02 07:10' },
];

export const MOCK_USERS: UserRecord[] = [
  { id: 'U1', name: 'Nguyễn Văn A', studentId: '2110123', plateNumber: '59A-123.45', lastEntry: '07:00', lastExit: '-', status: 'Inside' },
  { id: 'U2', name: 'Trần Thị B', studentId: '2110456', plateNumber: '59B-678.90', lastEntry: '06:30', lastExit: '07:15', status: 'Outside' },
];

export const TRAFFIC_DATA = [
  { hour: '06:00', count: 120 },
  { hour: '07:00', count: 450 },
  { hour: '08:00', count: 580 },
  { hour: '09:00', count: 320 },
  { hour: '10:00', count: 210 },
  { hour: '11:00', count: 400 },
  { hour: '12:00', count: 350 },
  { hour: '13:00', count: 280 },
  { hour: '14:00', count: 310 },
  { hour: '15:00', count: 420 },
  { hour: '16:00', count: 550 },
  { hour: '17:00', count: 620 },
];
