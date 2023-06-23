import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import {
  getUserReviews,
  getUserThankedReviews,
  getUserViewedMovies,
} from '../data/users.data';
import { prismaClient } from '../api-clients';
import { DbErrHandlerChain } from '../db-errors';
import { generateHashedPassword, getGenderFromReqParam } from '../utils';

export async function getPersonalViewedMovies(req: Request, res: Response) {
  const user = req.user as User;
  const result = await getUserViewedMovies(user.id);
  res.json(result);
}

export async function getPersonalReviews(req: Request, res: Response) {
  const user = req.user as User;
  const result = await getUserReviews(user.id);
  res.json(result);
}

export async function getPersonalThankedReviews(req: Request, res: Response) {
  const user = req.user as User;
  const result = await getUserThankedReviews(user.id);
  res.json(result);
}

export async function updatePersonalInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.user as User;
  const username = req.body.username;
  const avatarUrl = req.body.avatarUrl;
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
      where: { id: user.id },
      data: {
        username,
        email,
        avatarUrl,
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
