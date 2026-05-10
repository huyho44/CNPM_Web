import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  code?:   string;
}

/**
 * Global error handler — must be the LAST middleware registered in app.ts.
 * Always returns JSON, never HTML.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', err.message, err.stack);

  // Detect MySQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    res.status(503).json({
      error:   true,
      message: 'Database unavailable. Please try again later.',
      code:    'DB_CONNECTION_FAILED',
    });
    return;
  }

  res.status(err.status ?? 500).json({
    error:   true,
    message: err.message ?? 'Internal server error',
    code:    err.code    ?? 'INTERNAL_ERROR',
  });
}
