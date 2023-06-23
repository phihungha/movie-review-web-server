import { NextFunction, Request, Response } from 'express';
import {
  getUserReviews,
  getUserThankedReviews,
  getUserViewedMovies,
} from '../data/users.data';
import { prismaClient } from '../api-clients';
import { DbErrHandlerChain } from '../db-errors';
import { reqParamToGender } from '../utils';
import { getAuth } from 'firebase-admin/auth';
import { HttpBadRequest } from '../http-errors';

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

  const firebaseUid = req.firebaseUid;
  if (!firebaseUid) {
    throw new Error('Firebase user ID not provided');
  }

  const authService = getAuth();
  const firebaseUser = await authService.getUser(firebaseUid);
  if (!firebaseUser.email || !firebaseUser.displayName) {
    throw new HttpBadRequest('Firebase user lacks email or/and display name');
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
