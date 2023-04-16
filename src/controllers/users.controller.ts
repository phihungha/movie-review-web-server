import { NextFunction, Request, Response } from 'express';
import { getReviewsByUserId } from '../data/users.data';
import { getViewedMoviesByUserId } from '../data/users.data';
import { getThankedReviewsByUserId } from '../data/users.data';
import { HttpNotFoundError } from '../http-errors';

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
