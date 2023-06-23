import { NextFunction, Request, Response } from 'express';
import { getAvatarUploadUrl, getUserReviews } from '../data/users.data';
import { getUserViewedMovies } from '../data/users.data';
import { getUserThankedReviews } from '../data/users.data';
import { HttpBadRequest, HttpNotFoundError } from '../http-errors';
import { UserType } from '@prisma/client';
import { prismaClient } from '../api-clients';
import { DbErrHandlerChain } from '../db-errors';
import { reqParamToGender, reqParamToUserType } from '../utils';
import { getAuth } from 'firebase-admin/auth';

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = reqParamToGender(req.body.gender);
  const userType = reqParamToUserType(req.body.type);

  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    throw new Error('Firebase user ID not found.');
  }

  const authService = getAuth();
  const firebaseUser = await authService.getUser(firebaseUid);
  if (!firebaseUser.email || !firebaseUser.displayName) {
    throw new HttpBadRequest('Firebase user lacks email or/and display name');
  }

  let userTypeData;
  if (userType === UserType.Critic) {
    userTypeData = {
      criticUser: { create: { blogUrl } },
    };
  } else {
    userTypeData = {
      regularUser: { create: {} },
    };
  }

  try {
    const result = await prismaClient.user.create({
      data: {
        id: firebaseUid,
        username,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        gender,
        dateOfBirth,
        userType,
        ...userTypeData,
      },
    });
    await authService.setCustomUserClaims(firebaseUid, { fullAccess: true });
    const avatarUploadUrl = await getAvatarUploadUrl(result.id);
    res.json({ result, avatarUploadUrl });
  } catch (err) {
    DbErrHandlerChain.new().unique().handle(err, next);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!result) {
    return next(new HttpNotFoundError('User not found'));
  }
  res.json(result);
}

export async function getViewedMoviesOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.params.id;
  const result = await getUserViewedMovies(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}

export async function getReviewsOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.params.id;
  const result = await getUserReviews(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}

export async function getThankedReviewsOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.params.id;
  const result = await getUserThankedReviews(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}
