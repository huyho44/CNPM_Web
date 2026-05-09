// DATACORE snapshot — slightly diverges from local to demonstrate sync
import { User } from '../types';

export const DATACORE_USERS: User[] = [
  // Existing — unchanged
  { id: 'U001', name: 'Nguyen Van An', studentId: '2110001', cardId: 'CARD-001', role: 'Student', faculty: 'Computer Science & Engineering', vehicleType: 'Motorbike', plateNumber: '59A-123.45', status: 'Active', email: 'an.nguyen@hcmut.edu.vn' },
  { id: 'U002', name: 'Tran Thi Bich', studentId: '2110002', cardId: 'CARD-002', role: 'Student', faculty: 'Electronics & Telecommunications', vehicleType: 'Bicycle', plateNumber: '59B-678.90', status: 'Active', email: 'bich.tran@hcmut.edu.vn' },
  // Changed: U003 role revoked → Revoked status
  { id: 'U003', name: 'Le Hoang Cuong', studentId: '2110003', cardId: 'CARD-003', role: 'Student', faculty: 'Mechanical Engineering', vehicleType: 'Motorbike', plateNumber: '59C-111.22', status: 'Revoked', email: 'cuong.le@hcmut.edu.vn' },
  { id: 'U004', name: 'Pham Minh Dung', studentId: '2110004', cardId: 'CARD-004', role: 'Student', faculty: 'Civil Engineering', vehicleType: 'Motorbike', plateNumber: '59D-333.44', status: 'Active', email: 'dung.pham@hcmut.edu.vn' },
  { id: 'U005', name: 'Hoang Thu Ha', studentId: '2110005', cardId: 'CARD-005', role: 'Student', faculty: 'Industrial Management', vehicleType: 'Car', plateNumber: '59E-555.66', status: 'Active', email: 'ha.hoang@hcmut.edu.vn' },
  { id: 'U006', name: 'GS. Vo Trung Phong', studentId: 'STAFF-001', cardId: 'CARD-006', role: 'Staff', faculty: 'Computer Science & Engineering', vehicleType: 'Car', plateNumber: '51H-999.00', status: 'Active', email: 'phong.vo@hcmut.edu.vn' },
  // Changed: U007 promoted from Staff to a different faculty
  { id: 'U007', name: 'ThS. Nguyen Lan Anh', studentId: 'STAFF-002', cardId: 'CARD-007', role: 'Staff', faculty: 'Industrial Management', vehicleType: 'Motorbike', plateNumber: '51G-777.88', status: 'Active', email: 'lananh.nguyen@hcmut.edu.vn' },
  { id: 'U008', name: 'TS. Dang Quoc Hung', studentId: 'STAFF-003', cardId: 'CARD-008', role: 'Staff', faculty: 'Mechanical Engineering', vehicleType: 'Car', plateNumber: '51F-111.22', status: 'Active', email: 'hung.dang@hcmut.edu.vn' },
  { id: 'U009', name: 'Bui Thi Kim Yen', studentId: '2110009', cardId: 'CARD-009', role: 'Student', faculty: 'Chemical Engineering & Food Technology', vehicleType: 'Bicycle', plateNumber: '59F-222.33', status: 'Active', email: 'yen.bui@hcmut.edu.vn' },
  { id: 'U010', name: 'Do Minh Tuan', studentId: '2110010', cardId: 'CARD-010', role: 'Student', faculty: 'Computer Science & Engineering', vehicleType: 'Motorbike', plateNumber: '59G-444.55', status: 'Active', email: 'tuan.do@hcmut.edu.vn' },
  // NEW: Two new students not yet in local system
  { id: 'U011', name: 'Vu Thanh Long', studentId: '2110011', cardId: 'CARD-011', role: 'Student', faculty: 'Electronics & Telecommunications', vehicleType: 'Motorbike', plateNumber: '59H-666.77', status: 'Active', email: 'long.vu@hcmut.edu.vn' },
  { id: 'U012', name: 'Ngo Thi Lan', studentId: '2110012', cardId: 'CARD-012', role: 'Student', faculty: 'Computer Science & Engineering', vehicleType: 'Bicycle', plateNumber: '59K-888.99', status: 'Active', email: 'lan.ngo@hcmut.edu.vn' },
];
