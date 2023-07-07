import { NextFunction, Request, Response } from 'express';
import { HttpForbiddenError } from '../http-errors';

/**
 * Require authentication as new user
 * (no required personal info setup yet) on a route.
 */
export default async function requireNewUserAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user) {
    return next(
      new HttpForbiddenError(
        'User has already set up the required personal info',
      ),
    );
  }

  if (!req.decodedIdToken) {
    return next(new HttpForbiddenError());
  }

  next();
}
