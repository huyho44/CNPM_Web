import 'dotenv/config';
import express from 'express';
import parkingRouter from './modules/parking/parking.router';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Body parsing
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/parking', parkingRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
