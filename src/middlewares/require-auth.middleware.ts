import { NextFunction, Request, Response } from 'express';
import { HttpForbiddenError } from '../http-errors';

/**
 * Require authentication on a route.
 */
export default function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // TODO: Auth logic
  if (true) {
    next();
  } else {
    throw new HttpForbiddenError();
  }
}
