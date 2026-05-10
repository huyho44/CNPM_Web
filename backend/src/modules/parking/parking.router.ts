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
  handleGetCards,
  handleGetGates,
  handleGetOperators,
  handleGetTicketLogs,
  handleGetRfidLogs,
  handleGetDashboardStats,
  handleGetDashboardZones,
  handleGetDashboardTraffic,
} from './parking.controller';

const router = Router();

// Get data routes 
router.get('/cards',        handleGetCards);
router.get('/gates',        handleGetGates);
router.get('/operators',    handleGetOperators);
router.get('/ticket-logs',  handleGetTicketLogs);
router.get('/rfid-logs',    handleGetRfidLogs);

// Dashboard routes
router.get('/dashboard/stats',   handleGetDashboardStats);
router.get('/dashboard/zones',   handleGetDashboardZones);
router.get('/dashboard/traffic', handleGetDashboardTraffic);

// UC-01
router.post('/rfid-entry',       validate(RfidEntrySchema),       handleRfidEntry);
router.post('/rfid-exit',        validate(RfidExitSchema),        handleRfidExit);

// UC-02
router.post('/temp-ticket',      validate(TempTicketSchema),      handleIssueTempTicket);
router.post('/temp-ticket-exit', validate(TempTicketExitSchema),  handleTempTicketExit);

export default router;
