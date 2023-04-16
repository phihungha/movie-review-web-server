import { NextFunction, Request, Response } from 'express';
import { User } from '@prisma/client';
import {
  getReviewsOfUser,
  getThankedReviewsOfUser,
  getViewedMoviesOfUser,
} from '../data/users.data';

export async function getViewedMoviesOfCurrentUser(
  req: Request,
  res: Response,
) {
  const user = req.user as User;
  const result = await getViewedMoviesOfUser(user.id);
  res.json(result);
}

export async function getReviewsOfCurrentUser(req: Request, res: Response) {
  const user = req.user as User;
  const result = await getReviewsOfUser(user.id);
  res.json(result);
}

export async function getThankedReviewsOfCurrentUser(
  req: Request,
  res: Response,
) {
  const user = req.user as User;
  const result = await getThankedReviewsOfUser(user.id);
  res.json(result);
}
