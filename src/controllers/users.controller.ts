import { NextFunction, Request, Response } from 'express';
import { getReviewsByUserId } from '../data/users.data';
import { getViewedMoviesByUserId } from '../data/users.data';
import { getThankedReviewsByUserId } from '../data/users.data';
import { HttpNotFoundError } from '../http-errors';
import { UserType } from '@prisma/client';
import { prismaClient } from '../db';
import { DbErrHandlerChain } from '../db-errors';
import {
  generateHashedPassword,
  getGenderFromReqParam,
  getUserTypeFromReqParam,
} from '../utils';

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
    const { hashedPassword, ...sanitizedResult } = result;
    res.json(sanitizedResult);
  } catch (err) {
    DbErrHandlerChain.new().unique().handle(err, next);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = +req.params.id;
  const result = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
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
  const result = await getViewedMoviesByUserId(userId);
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
  const result = await getReviewsByUserId(userId);
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
  const result = await getThankedReviewsByUserId(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}
