import { NextFunction, Request, Response } from 'express';
import { HttpForbiddenError } from '../http-errors';

/**
 * Require authentication on a route.
 */
export default async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.decodedIdToken) {
    return next(new HttpForbiddenError());
  }

  if (!req.user) {
    return next(
      new HttpForbiddenError('User has not setup the required personal info'),
    );
  }

  next();
}
