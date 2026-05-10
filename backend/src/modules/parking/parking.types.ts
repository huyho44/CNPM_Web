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
