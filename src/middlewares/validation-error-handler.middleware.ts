import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * Process express-validator validation exceptions and
 * respond with a proper status code and error message.
 */
export default function validationErrorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
}
