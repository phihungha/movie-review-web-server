import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import {
  getReviewsByUserId,
  getThankedReviewsByUserId,
  getViewedMoviesByUserId,
} from '../data/users.data';

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
