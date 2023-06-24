import { NextFunction, Request, Response } from 'express';
import { HttpForbiddenError } from '../http-errors';
import { getDecodedIdToken } from '../data/auth.data';
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

  const decodedIdToken = await getDecodedIdToken(idToken);
  if (!decodedIdToken) {
    next(new HttpForbiddenError());
    return;
  }

  const user = await prismaClient.user.findUnique({
    where: { id: decodedIdToken.uid },
  });
  if (!user) {
    next(
      new HttpForbiddenError('User has not setup the required personal info'),
    );
    return;
  }

  req.user = user;
  req.decodedIdToken = decodedIdToken;
  next();
}
