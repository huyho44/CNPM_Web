import { Request, Response, NextFunction } from 'express';
import * as parkingService from './parking.service';
import {
  RfidEntryRequest,
  RfidExitRequest,
  TempTicketRequest,
  TempTicketExitRequest,
} from './parking.types';


function statusFromResult(result: string): number {
  return result === 'ERROR' ? 500 : 200;
}

// ============================================================
// POST /api/parking/rfid-entry
// ============================================================
export async function handleRfidEntry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { card_uid, gate_id } = req.body as RfidEntryRequest;
    const data = await parkingService.rfidEntry(card_uid, gate_id);
    res.status(statusFromResult(data.result)).json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// POST /api/parking/rfid-exit
// ============================================================
export async function handleRfidExit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { card_uid, gate_id } = req.body as RfidExitRequest;
    const data = await parkingService.rfidExit(card_uid, gate_id);
    res.status(statusFromResult(data.result)).json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// POST /api/parking/temp-ticket
// ============================================================
export async function handleIssueTempTicket(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { gate_id, issued_by, operator_id } = req.body as TempTicketRequest;
    const data = await parkingService.issueTempTicket(
      gate_id,
      issued_by,
      operator_id ?? null,
    );
    res.status(statusFromResult(data.result)).json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// POST /api/parking/temp-ticket-exit
// ============================================================
export async function handleTempTicketExit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { ticket_code, gate_id } = req.body as TempTicketExitRequest;
    const data = await parkingService.tempTicketExit(ticket_code, gate_id);
    res.status(statusFromResult(data.result)).json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// GET /api/parking/cards
// ============================================================
export async function handleGetCards(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await parkingService.getCards();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// GET /api/parking/gates
// ============================================================
export async function handleGetGates(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await parkingService.getGates();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// GET /api/parking/operators
// ============================================================
export async function handleGetOperators(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await parkingService.getOperators();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// GET /api/parking/ticket-logs
// ============================================================
export async function handleGetTicketLogs(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await parkingService.getTicketLogs();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// GET /api/parking/rfid-logs
// ============================================================
export async function handleGetRfidLogs(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await parkingService.getRfidLogs();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
