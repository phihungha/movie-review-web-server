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
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next(new HttpForbiddenError());
    return;
  }

  const authHeaderParts = authHeader.split('Bearer ');
  const idToken = authHeaderParts.at(1);
  if (!idToken) {
    next(new HttpForbiddenError());
    return;
  }

  const firebaseUid = await getFirebaseUid(idToken);
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
    return;
  }
  req.user = user;

  next();
}
