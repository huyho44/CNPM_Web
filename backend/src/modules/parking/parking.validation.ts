import { z } from 'zod';

// UC-01: RFID Entry
export const RfidEntrySchema = z.object({
  card_uid: z.string().min(1).max(64),
  gate_id:  z.string().uuid('gate_id must be a valid UUID'),
});

// UC-01: RFID Exit
export const RfidExitSchema = z.object({
  card_uid: z.string().min(1).max(64),
  gate_id:  z.string().uuid('gate_id must be a valid UUID'),
});

// UC-02: Issue Temporary Ticket
export const TempTicketSchema = z.object({
  gate_id:     z.string().uuid('gate_id must be a valid UUID'),
  issued_by:   z.enum(['KIOSK', 'OPERATOR']),
  operator_id: z.string().uuid('operator_id must be a valid UUID').nullable().optional(),
});

// UC-02: Temp Ticket Exit
export const TempTicketExitSchema = z.object({
  ticket_code: z.string().min(1).max(64),
  gate_id:     z.string().uuid('gate_id must be a valid UUID'),
});
