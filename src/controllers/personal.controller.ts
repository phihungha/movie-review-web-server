import { NextFunction, Request, Response } from 'express';
import {
  getAvatarUploadUrl,
  getUserReviews,
  getUserThankedReviews,
  getUserViewedMovies,
  getUserDetails,
} from '../data/users.data';
import { prismaClient } from '../api-clients';
import { DbErrHandlerChain } from '../db-errors';
import { reqParamToGender, reqParamToUserType } from '../utils';
import { getAuth } from 'firebase-admin/auth';
import { UserType } from '@prisma/client';

export async function getPersonalDetails(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new Error('User does not exist in request');
  }
  const result = await getUserDetails(user.id);
  res.json(result);
}

export async function getPersonalViewedMovies(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new Error('User does not exist in request');
  }
  const result = await getUserViewedMovies(user.id);
  res.json(result);
}

export async function getPersonalReviews(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new Error('User does not exist in request');
  }
  const result = await getUserReviews(user.id);
  res.json(result);
}

export async function getPersonalThankedReviews(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    throw new Error('User does not exist in request');
  }
  const result = await getUserThankedReviews(user.id);
  res.json(result);
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = reqParamToGender(req.body.gender);
  const userType = reqParamToUserType(req.body.type);

  const decodedIdToken = req.decodedIdToken;
  if (!decodedIdToken) {
    throw new Error('Firebase ID token not provided');
  }

  const authService = getAuth();
  const firebaseUid = decodedIdToken.uid;
  const firebaseUser = await authService.getUser(decodedIdToken.uid);
  if (!firebaseUser.email || !firebaseUser.displayName) {
    throw new Error('Firebase user lacks email or/and display name');
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
    await authService.setCustomUserClaims(firebaseUid, {
      fullAccess: true,
      role: userType,
    });
    const avatarUploadUrl = await getAvatarUploadUrl(result.id);
    res.json({ result, avatarUploadUrl });
  } catch (err) {
    DbErrHandlerChain.new().unique().handle(err, next);
  }
}

export async function updatePersonalInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const username = req.body.username;
  const avatarUrl = req.body.avatarUrl;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = reqParamToGender(req.body.gender);

  const decodedIdToken = req.decodedIdToken;
  if (!decodedIdToken) {
    throw new Error('Firebase user ID not provided');
  }

  const authService = getAuth();
  const firebaseUid = decodedIdToken.uid;
  const firebaseUser = await authService.getUser(decodedIdToken.uid);
  if (!firebaseUser.email || !firebaseUser.displayName) {
    throw new Error('Firebase user lacks email or/and display name');
  }

  let userTypeData;
  if (blogUrl) {
    userTypeData = {
      criticUser: {
        update: { blogUrl },
      },
    };
  }

  try {
    const result = await prismaClient.user.update({
      where: { id: firebaseUid },
      data: {
        username,
        email: firebaseUser.email,
        avatarUrl,
        name: firebaseUser.displayName,
        gender,
        dateOfBirth,
        ...userTypeData,
      },
    });
    res.json(result);
  } catch (err) {
    DbErrHandlerChain.new().notFound().unique().handle(err, next);
  }
}
