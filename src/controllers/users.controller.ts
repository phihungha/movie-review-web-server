import { NextFunction, Request, Response } from 'express';
import { getUserReviews } from '../data/users.data';
import { getUserViewedMovies } from '../data/users.data';
import { getUserThankedReviews } from '../data/users.data';
import { HttpNotFoundError } from '../http-errors';
import { prismaClient } from '../api-clients';

export async function getUsers(req: Request, res: Response) {
  const searchTerm = req.query.searchTerm as string | undefined;
  const result = await prismaClient.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm ?? '', mode: 'insensitive' } },
        { username: { contains: searchTerm ?? '', mode: 'insensitive' } },
      ],
    },
  });
  res.json(result);
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!result) {
    return next(new HttpNotFoundError('User not found'));
  }
  res.json(result);
}

export async function getViewedMoviesOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.params.id;
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
  const userId = req.params.id;
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
  const userId = req.params.id;
  const result = await getUserThankedReviews(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}
