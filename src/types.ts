export type ParkingStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface ParkingSlot {
  id: string;
  status: ParkingStatus;
  zone: string;
  coordinate: { x: number; y: number };
}

export interface Alert {
  id: string;
  type: 'Sensor' | 'Gateway' | 'Auth' | 'System';
  message: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface GateStatus {
  id: string;
  name: string;
  barrierOpen: boolean;
  cameraUrl: string;
  waitingCount: number;
}

export interface PricingPolicy {
  id: string;
  userType: 'Student' | 'Staff' | 'Guest';
  pricePerTurn: number;
  pricePerHour: number;
  effectiveDate: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  plateNumber: string;
  amount: number;
  status: 'Paid' | 'Debt' | 'Pending';
  timestamp: string;
}

export interface UserRecord {
  id: string;
  name: string;
  studentId: string;
  plateNumber: string;
  lastEntry: string;
  lastExit: string;
  status: 'Inside' | 'Outside';
}
