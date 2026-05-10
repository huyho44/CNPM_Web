import { Router } from 'express';
import { validate } from '../../middleware/validate';
import {
  RfidEntrySchema,
  RfidExitSchema,
  TempTicketSchema,
  TempTicketExitSchema,
} from './parking.validation';
import {
  handleRfidEntry,
  handleRfidExit,
  handleIssueTempTicket,
  handleTempTicketExit,
} from './parking.controller';

const router = Router();

// UC-01
router.post('/rfid-entry',       validate(RfidEntrySchema),       handleRfidEntry);
router.post('/rfid-exit',        validate(RfidExitSchema),        handleRfidExit);

// UC-02
router.post('/temp-ticket',      validate(TempTicketSchema),      handleIssueTempTicket);
router.post('/temp-ticket-exit', validate(TempTicketExitSchema),  handleTempTicketExit);

export default router;
