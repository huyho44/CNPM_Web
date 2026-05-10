import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Reusable middleware factory that validates req.body against a Zod schema.
 * Returns 400 with structured error details on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      res.status(400).json({
        error:   true,
        message: 'Validation failed',
        details: errors,
      });
      return;
    }
    req.body = result.data; // replace with parsed+coerced data
    next();
  };
}
