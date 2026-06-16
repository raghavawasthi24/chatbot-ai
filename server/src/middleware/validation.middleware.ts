import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { config } from '../config/env';

/**
 * Runs the accumulated express-validator checks and short-circuits
 * with a 422 if any rule fails. Used as the last item in every
 * validation chain so the controller receives only clean data.
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      error: {
        message: 'Validation failed.',
        details: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg })),
      },
    });
    return;
  }
  next();
};

/** Validation chain for POST /chat/message */
export const validateSendMessage = [
  body('message')
    .isString()
    .withMessage('message must be a string.')
    .trim()
    .notEmpty()
    .withMessage('message cannot be empty.')
    .isLength({ max: config.chat.maxMessageLength })
    .withMessage(`message cannot exceed ${config.chat.maxMessageLength} characters.`),

  body('sessionId')
    .optional()
    .isUUID()
    .withMessage('sessionId must be a valid UUID.'),

  handleValidationErrors,
];

/** Validation chain for GET /chat/history/:sessionId */
export const validateSessionId = [
  param('sessionId')
    .isUUID()
    .withMessage('sessionId must be a valid UUID.'),

  handleValidationErrors,
];
