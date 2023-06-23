import { NextFunction, Request, Response } from 'express';
import { getUserReviews } from '../data/users.data';
import { getUserViewedMovies } from '../data/users.data';
import { getUserThankedReviews } from '../data/users.data';
import { HttpNotFoundError } from '../http-errors';
import { UserType } from '@prisma/client';
import { prismaClient, s3Client } from '../api-clients';
import { DbErrHandlerChain } from '../db-errors';
import {
  generateHashedPassword,
  getGenderFromReqParam,
  getUserTypeFromReqParam,
} from '../utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getAvatarUploadUrl(userId: number) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `'public/userProfileImages/${userId}.webp`,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = getGenderFromReqParam(req.body.gender);
  const newHashedPassword = await generateHashedPassword(req.body.password);
  const userType = getUserTypeFromReqParam(req.body.type);

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
        username,
        email,
        hashedPassword: newHashedPassword,
        name,
        gender,
        dateOfBirth,
        userType,
        ...userTypeData,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, avatarUrl, ...sanitizedResult } = result;
    res.json({
      ...sanitizedResult,
      avatarUploadUrl: await getAvatarUploadUrl(result.id),
    });
  } catch (err) {
    DbErrHandlerChain.new().unique().handle(err, next);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = +req.params.id;
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!result) {
    return next(new HttpNotFoundError('User not found'));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashedPassword, ...sanitizedResult } = result;
  res.json(sanitizedResult);
}

export async function getViewedMoviesOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = +req.params.id;
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
  const userId = +req.params.id;
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
  const userId = +req.params.id;
  const result = await getUserThankedReviews(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}
