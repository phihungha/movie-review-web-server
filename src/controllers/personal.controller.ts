import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import {
  getReviewsByUserId,
  getThankedReviewsByUserId,
  getViewedMoviesByUserId,
} from '../data/users.data';
import { prismaClient } from '../db';
import { DbErrHandlerChain } from '../db-errors';
import { generateHashedPassword, getGenderFromReqParam } from '../utils';

export async function getViewedMoviesOfCurrentUser(
  req: Request,
  res: Response,
) {
  const user = req.user as User;
  const result = await getViewedMoviesByUserId(user.id);
  res.json(result);
}

export async function getReviewsOfCurrentUser(req: Request, res: Response) {
  const user = req.user as User;
  const result = await getReviewsByUserId(user.id);
  res.json(result);
}

export async function getThankedReviewsOfCurrentUser(
  req: Request,
  res: Response,
) {
  const user = req.user as User;
  const result = await getThankedReviewsByUserId(user.id);
  res.json(result);
}

export async function updatePersonalInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user as User;
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = getGenderFromReqParam(req.body.gender);

  let newHashedPassword;
  if (req.body.password) {
    newHashedPassword = await generateHashedPassword(req.body.password);
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
      where: {
        id: user.id,
      },
      data: {
        username,
        email,
        hashedPassword: newHashedPassword,
        name,
        gender,
        dateOfBirth,
        ...userTypeData,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...sanitizedResult } = result;
    res.json(sanitizedResult);
  } catch (err) {
    DbErrHandlerChain.new().notFound().unique().handle(err, next);
  }
}
