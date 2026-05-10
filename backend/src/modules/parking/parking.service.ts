import pool from '../../config/db';
import {
  ParkingResult,
  ExitResult,
  TicketResult,
  TicketExitResult,
  CardRow,
  GateRow,
  OperatorRow,
  TicketLogRow,
  RfidLogRow,
} from './parking.types';

// ── Helper: read a row of OUT parameters after a CALL statement ──────────────
async function readOutParams<T>(sql: string): Promise<T> {
  const [rows] = await pool.query(sql);
  return (rows as T[])[0];
}

// ============================================================
// UC-01: rfidEntry
// Calls sp_rfid_entry(card_uid, gate_id, @r, @m, @s)
// ============================================================
export async function rfidEntry(
  card_uid: string,
  gate_id:  string,
): Promise<ParkingResult> {
  await pool.query(
    'CALL sp_rfid_entry(?, ?, @r_result, @r_message, @r_session_id)',
    [card_uid, gate_id],
  );

  const out = await readOutParams<{
    result:     string;
    message:    string;
    session_id: string | null;
  }>('SELECT @r_result AS result, @r_message AS message, @r_session_id AS session_id');

  return {
    result:     out.result as ParkingResult['result'],
    message:    out.message,
    session_id: out.session_id ?? null,
  };
}

// ============================================================
// UC-01: rfidExit
// Calls sp_rfid_exit(card_uid, gate_id, @r, @m, @d, @f)
// ============================================================
export async function rfidExit(
  card_uid: string,
  gate_id:  string,
): Promise<ExitResult> {
  await pool.query(
    'CALL sp_rfid_exit(?, ?, @r_result, @r_message, @r_duration, @r_fee)',
    [card_uid, gate_id],
  );

  const out = await readOutParams<{
    result:           string;
    message:          string;
    duration_minutes: number | null;
    fee_applicable:   number | null;  // MySQL returns BOOLEAN as 0/1
  }>('SELECT @r_result AS result, @r_message AS message, @r_duration AS duration_minutes, @r_fee AS fee_applicable');

  return {
    result:           out.result as ExitResult['result'],
    message:          out.message,
    duration_minutes: out.duration_minutes ?? null,
    fee_applicable:   out.fee_applicable !== null ? Boolean(out.fee_applicable) : null,
  };
}

// ============================================================
// UC-02: issueTempTicket
// Calls sp_issue_temp_ticket(gate_id, issued_by, operator_id, @r, @m, @t, @s)
// ============================================================
export async function issueTempTicket(
  gate_id:     string,
  issued_by:   'KIOSK' | 'OPERATOR',
  operator_id: string | null,
): Promise<TicketResult> {
  await pool.query(
    'CALL sp_issue_temp_ticket(?, ?, ?, @r_result, @r_message, @r_ticket_code, @r_session_id)',
    [gate_id, issued_by, operator_id],
  );

  const out = await readOutParams<{
    result:      string;
    message:     string;
    ticket_code: string | null;
    session_id:  string | null;
  }>('SELECT @r_result AS result, @r_message AS message, @r_ticket_code AS ticket_code, @r_session_id AS session_id');

  return {
    result:      out.result as TicketResult['result'],
    message:     out.message,
    ticket_code: out.ticket_code ?? null,
    session_id:  out.session_id ?? null,
  };
}

// ============================================================
// UC-02: tempTicketExit
// Calls sp_temp_ticket_exit(ticket_code, gate_id, @r, @m, @d)
// ============================================================
export async function tempTicketExit(
  ticket_code: string,
  gate_id:     string,
): Promise<TicketExitResult> {
  await pool.query(
    'CALL sp_temp_ticket_exit(?, ?, @r_result, @r_message, @r_duration)',
    [ticket_code, gate_id],
  );

  const out = await readOutParams<{
    result:           string;
    message:          string;
    duration_minutes: number | null;
  }>('SELECT @r_result AS result, @r_message AS message, @r_duration AS duration_minutes');

  return {
    result:           out.result as TicketExitResult['result'],
    message:          out.message,
    duration_minutes: out.duration_minutes ?? null,
  };
}

// ============================================================
// GET /api/parking/cards
// ============================================================
export async function getCards(): Promise<CardRow[]> {
  const [rows] = await pool.query(`
    SELECT
      rc.card_uid,
      u.full_name,
      u.role,
      u.status,
      u.sub_role
    FROM rfid_cards rc
    JOIN users u ON u.id = rc.user_id
    ORDER BY u.full_name ASC
  `);
  return rows as CardRow[];
}

// ============================================================
// GET /api/parking/gates
// ============================================================
export async function getGates(): Promise<GateRow[]> {
  const [rows] = await pool.query(`
    SELECT
      g.id        AS gate_id,
      g.gate_code,
      g.direction,
      g.status,
      pz.name     AS zone_name
    FROM gates g
    JOIN parking_zones pz ON pz.id = g.zone_id
    ORDER BY g.gate_code ASC
  `);
  return rows as GateRow[];
}

// ============================================================
// GET /api/parking/operators
// ============================================================
export async function getOperators(): Promise<OperatorRow[]> {
  const [rows] = await pool.query(`
    SELECT
      id            AS user_id,
      full_name,
      university_id,
      sub_role
    FROM users
    WHERE role   = 'STAFF'
      AND status = 'ACTIVE'
    ORDER BY full_name ASC
  `);
  return rows as OperatorRow[];
}

// ============================================================
// GET /api/parking/ticket-logs
// ============================================================
export async function getTicketLogs(limit = 100): Promise<TicketLogRow[]> {
  const [rows] = await pool.query(`
    SELECT
      al.id                         AS log_id,
      DATE_FORMAT(al.event_time,
        '%Y-%m-%dT%H:%i:%s')         AS event_time,
      al.direction,
      g.gate_code,
      pz.name                       AS zone_name,
      al.ticket_code,
      al.result,
      al.deny_reason,
      tt.issued_by,
      al.session_id
    FROM access_logs al
    JOIN  gates          g   ON g.id  = al.gate_id
    JOIN  parking_zones  pz  ON pz.id = g.zone_id
    LEFT JOIN temporary_tickets tt ON tt.ticket_code = al.ticket_code
    WHERE al.access_method = 'TEMPORARY_TICKET'
    ORDER BY al.event_time DESC
    LIMIT ?
  `, [limit]);
  return rows as TicketLogRow[];
}

// ============================================================
// GET /api/parking/rfid-logs
// ============================================================
export async function getRfidLogs(limit = 100): Promise<RfidLogRow[]> {
  const [rows] = await pool.query(`
    SELECT
      al.id                         AS log_id,
      DATE_FORMAT(al.event_time,
        '%Y-%m-%dT%H:%i:%s')         AS event_time,
      al.direction,
      g.gate_code,
      pz.name                       AS zone_name,
      al.card_uid,
      u.full_name,
      u.role,
      al.result,
      al.deny_reason,
      al.session_id
    FROM access_logs al
    JOIN  gates          g   ON g.id   = al.gate_id
    JOIN  parking_zones  pz  ON pz.id  = g.zone_id
    LEFT JOIN rfid_cards rc  ON rc.card_uid = al.card_uid
    LEFT JOIN users      u   ON u.id   = rc.user_id
    WHERE al.access_method = 'RFID'
    ORDER BY al.event_time DESC
    LIMIT ?
  `, [limit]);
  return rows as RfidLogRow[];
}
