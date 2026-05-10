// ============================================================
// src/api/parkingApi.ts
// Typed fetch client for the backend
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE: string = ((import.meta as any).env?.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

// ── Response shapes ─
export type AccessResult = 'GRANTED' | 'DENIED' | 'ERROR';

export interface RfidEntryResponse {
  result:     AccessResult;
  message:    string;
  session_id: string | null;
}

export interface RfidExitResponse {
  result:           AccessResult;
  message:          string;
  duration_minutes: number | null;
  fee_applicable:   boolean | null;
}

export interface TempTicketResponse {
  result:      AccessResult;
  message:     string;
  ticket_code: string | null;
  session_id:  string | null;
}

export interface TempTicketExitResponse {
  result:           AccessResult;
  message:          string;
  duration_minutes: number | null;
}

export interface ApiError {
  error:   true;
  message: string;
  code?:   string;
  details?: { field: string; message: string }[];
}

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

// ── Internal helper 
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api/parking${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok && res.status === 400) {
    // Validation error from backend 
    throw data as ApiError;
  }
  return data as T;
}

// UC-01: RFID Entry 
export function rfidEntry(card_uid: string, gate_id: string): Promise<RfidEntryResponse> {
  return post('/rfid-entry', { card_uid, gate_id });
}

// UC-01: RFID Exit 
export function rfidExit(card_uid: string, gate_id: string): Promise<RfidExitResponse> {
  return post('/rfid-exit', { card_uid, gate_id });
}

// UC-02: Issue Temporary Ticket 
export function issueTempTicket(
  gate_id:     string,
  issued_by:   'KIOSK' | 'OPERATOR',
  operator_id: string | null,
): Promise<TempTicketResponse> {
  return post('/temp-ticket', { gate_id, issued_by, operator_id });
}

// UC-02: Temp Ticket Exit 
export function tempTicketExit(
  ticket_code: string,
  gate_id:     string,
): Promise<TempTicketExitResponse> {
  return post('/temp-ticket-exit', { ticket_code, gate_id });
}


// GET /api/parking/cards 
export async function getCards(): Promise<CardRow[]> {
  const res = await fetch(`${BASE}/api/parking/cards`);
  if (!res.ok) throw new Error('Failed to load cards');
  return res.json() as Promise<CardRow[]>;
}

// GET /api/parking/gates 
export async function getGates(): Promise<GateRow[]> {
  const res = await fetch(`${BASE}/api/parking/gates`);
  if (!res.ok) throw new Error('Failed to load gates');
  return res.json() as Promise<GateRow[]>;
}

export interface OperatorRow {
  user_id:       string;
  full_name:     string;
  university_id: string;
  sub_role:      string | null;
}

// GET /api/parking/operators 
export async function getOperators(): Promise<OperatorRow[]> {
  const res = await fetch(`${BASE}/api/parking/operators`);
  if (!res.ok) throw new Error('Failed to load operators');
  return res.json() as Promise<OperatorRow[]>;
}

export interface TicketLogRow {
  log_id:      string;
  event_time:  string;
  direction:   'ENTRY' | 'EXIT';
  gate_code:   string;
  zone_name:   string;
  ticket_code: string | null;
  result:      'GRANTED' | 'DENIED' | 'ERROR';
  deny_reason: string | null;
  issued_by:   'KIOSK' | 'OPERATOR' | null;
  session_id:  string | null;
}

// GET /api/parking/ticket-logs — TEMPORARY_TICKET access_log entries
export async function getTicketLogs(): Promise<TicketLogRow[]> {
  const res = await fetch(`${BASE}/api/parking/ticket-logs`);
  if (!res.ok) throw new Error('Failed to load ticket logs');
  return res.json() as Promise<TicketLogRow[]>;
}

export interface RfidLogRow {
  log_id:      string;
  event_time:  string;
  direction:   'ENTRY' | 'EXIT';
  gate_code:   string;
  zone_name:   string;
  card_uid:    string | null;
  full_name:   string | null;
  role:        'LEARNER' | 'FACULTY' | 'STAFF' | null;
  result:      'GRANTED' | 'DENIED' | 'ERROR';
  deny_reason: string | null;
  session_id:  string | null;
}

// GET /api/parking/rfid-logs — RFID access_log entries
export async function getRfidLogs(): Promise<RfidLogRow[]> {
  const res = await fetch(`${BASE}/api/parking/rfid-logs`);
  if (!res.ok) throw new Error('Failed to load RFID logs');
  return res.json() as Promise<RfidLogRow[]>;
}
