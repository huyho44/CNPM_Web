// ============================================================
// parking.types.ts — TypeScript interfaces for UC-01 & UC-02
// ============================================================

// ── Request types ─────────────────────────────────────────────
export interface RfidEntryRequest {
  card_uid: string;
  gate_id:  string;
}

export interface RfidExitRequest {
  card_uid: string;
  gate_id:  string;
}

export interface TempTicketRequest {
  gate_id:     string;
  issued_by:   'KIOSK' | 'OPERATOR';
  operator_id: string | null;
}

export interface TempTicketExitRequest {
  ticket_code: string;
  gate_id:     string;
}

// ── Response types ────────────────────────────────────────────
export type AccessResult = 'GRANTED' | 'DENIED' | 'ERROR';

export interface ParkingResult {
  result:     AccessResult;
  message:    string;
  session_id: string | null;
}

export interface ExitResult {
  result:           AccessResult;
  message:          string;
  duration_minutes: number | null;
  fee_applicable:   boolean | null;
}

export interface TicketResult {
  result:      AccessResult;
  message:     string;
  ticket_code: string | null;
  session_id:  string | null;
}

export interface TicketExitResult {
  result:           AccessResult;
  message:          string;
  duration_minutes: number | null;
}

// ── Query result row types ────────────────────────────────────
export interface CardRow {
  card_uid:  string;
  full_name: string;
  role:      'LEARNER' | 'FACULTY' | 'STAFF';
  status:    'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  sub_role:  string | null;
}

export interface GateRow {
  gate_id:   string;
  gate_code: string;
  direction: 'ENTRY' | 'EXIT' | 'BOTH';
  status:    'ONLINE' | 'OFFLINE' | 'FAULT';
  zone_name: string;
}

export interface OperatorRow {
  user_id:       string;
  full_name:     string;
  university_id: string;
  sub_role:      string | null;
}

export interface TicketLogRow {
  log_id:       string;
  event_time:   string;
  direction:    'ENTRY' | 'EXIT';
  gate_code:    string;
  zone_name:    string;
  ticket_code:  string | null;
  result:       'GRANTED' | 'DENIED' | 'ERROR';
  deny_reason:  string | null;
  issued_by:    'KIOSK' | 'OPERATOR' | null;
  session_id:   string | null;
}

export interface RfidLogRow {
  log_id:      string;
  event_time:  string;           // ISO datetime string
  direction:   'ENTRY' | 'EXIT';
  gate_code:   string;
  zone_name:   string;
  card_uid:    string | null;
  full_name:   string | null;    // from users via rfid_cards
  role:        'LEARNER' | 'FACULTY' | 'STAFF' | null;
  result:      'GRANTED' | 'DENIED' | 'ERROR';
  deny_reason: string | null;
  session_id:  string | null;
}

// ── Dashboard Data Types ──────────────────────────────────────────
export interface DashboardStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  activeSessions: number;
  faults: number;
}

export interface ZoneSignage {
  id: string;
  name: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  maintenanceSlots: number;
  availability: 'Available' | 'Nearly Full' | 'Full' | 'Uncertain';
  signageText: string;
  gatewayConnected: boolean;
}

export interface TrafficPoint {
  hour: string;
  count: number;
}
