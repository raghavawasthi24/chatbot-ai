import { AppError } from '../types';

/**
 * Creates an operational error — safe to surface to the client.
 * Non-operational errors (bugs, unhandled exceptions) should be
 * thrown as plain Error objects and are caught by the global handler.
 */
export const createError = (message: string, statusCode: number): AppError => {
  const err = new Error(message) as AppError;
  err.statusCode    = statusCode;
  err.isOperational = true;
  return err;
};
