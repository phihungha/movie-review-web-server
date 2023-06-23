import { NextFunction, Request, Response } from 'express';
import { HttpForbiddenError } from '../http-errors';
import { getFirebaseUid } from '../data/auth.data';
import { prismaClient } from '../api-clients';

/**
 * Require authentication on a route.
 */
export default async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers.authorization) {
    next(new HttpForbiddenError());
    return;
  }

  const firebaseUid = await getFirebaseUid(req.headers.authorization);
  if (!firebaseUid) {
    next(new HttpForbiddenError());
    return;
  }

  const user = await prismaClient.user.findUnique({
    where: { id: firebaseUid },
  });
  if (!user) {
    next(
      new HttpForbiddenError('User has not setup the required personal info'),
    );
  }

  next();
}
