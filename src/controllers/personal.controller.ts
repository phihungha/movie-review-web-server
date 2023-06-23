import { NextFunction, Request, Response } from 'express';
import {
  getUserReviews,
  getUserThankedReviews,
  getUserViewedMovies,
} from '../data/users.data';
import { prismaClient } from '../api-clients';
import { DbErrHandlerChain } from '../db-errors';
import { reqParamToGender } from '../utils';

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
  const user = req.user;
  if (!user) {
    throw new Error('User does not exist in request');
  }

  const username = req.body.username;
  const avatarUrl = req.body.avatarUrl;
  const email = req.body.email;
  const name = req.body.name;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = reqParamToGender(req.body.gender);

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
        name,
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
