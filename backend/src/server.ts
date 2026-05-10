import 'dotenv/config';
import app from './app';
import { testConnection } from './config/db';

const PORT = Number(process.env.APP_PORT ?? 3001);

async function main(): Promise<void> {
  // Verify DB connectivity before accepting requests
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
    console.log(`    Health check: http://localhost:${PORT}/health`);
    console.log(`    RFID Entry:   POST http://localhost:${PORT}/api/parking/rfid-entry`);
    console.log(`    RFID Exit:    POST http://localhost:${PORT}/api/parking/rfid-exit`);
    console.log(`    Temp Ticket:  POST http://localhost:${PORT}/api/parking/temp-ticket`);
    console.log(`    Ticket Exit:  POST http://localhost:${PORT}/api/parking/temp-ticket-exit`);
  });
}

main().catch(err => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});
