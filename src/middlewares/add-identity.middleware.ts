import { NextFunction, Request, Response } from 'express';
import { getDecodedIdToken } from '../data/auth.data';
import { prismaClient } from '../api-clients';

/**
 * Add user and Firebase ID token to a request
 * if there is a bearer token in it.
 */
export default async function addIdentity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const authHeaderParts = authHeader.split('Bearer ');
  const idToken = authHeaderParts.at(1);
  if (!idToken) {
    return next();
  }

  const decodedIdToken = await getDecodedIdToken(idToken);
  if (!decodedIdToken) {
    return next();
  }
  req.decodedIdToken = decodedIdToken;

  const user = await prismaClient.user.findUnique({
    where: { id: decodedIdToken.uid },
  });
  if (!user) {
    return next();
  }
  req.user = user;
  next();
}
