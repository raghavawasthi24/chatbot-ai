import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../types';
import { config } from '../config/env';

/**
 * Catch-all error handler.
 * Operational errors (isOperational === true) are user-facing and
 * returned with their own statusCode + message.
 * All other errors are treated as bugs — logged in full, returned as 500.
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const isOperational = (err as AppError).isOperational === true;
  const statusCode    = isOperational ? (err as AppError).statusCode : 500;

  if (!isOperational) {
    // Unexpected bug — always log the full stack
    console.error('[Unhandled error]', err);
  }

  res.status(statusCode).json({
    error: {
      message: isOperational
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
      // Expose stack only in development for easier debugging
      ...(config.isDev && !isOperational && { stack: err.stack }),
    },
  });
};

/** 404 handler — must be registered AFTER all routes. */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: { message: 'Resource not found.' } });
};
