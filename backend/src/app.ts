import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import parkingRouter from './modules/parking/parking.router';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// CORS 
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

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
