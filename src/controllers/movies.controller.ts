import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '../api-clients';
import { HttpNotFoundError } from '../http-errors';

export async function getMovies(req: Request, res: Response) {
  const searchTerm = req.query.searchTerm as string | undefined;
  const result = await prismaClient.movie.findMany({
    where: {
      title: { contains: searchTerm, mode: 'insensitive' },
    },
  });
  res.json(result);
}

export async function getMovieDetails(req: Request, res: Response) {
  const movieId = +req.params.id;
  const result = await prismaClient.movie.findUnique({
    where: {
      id: movieId,
    },
    include: {
      directors: true,
      writers: true,
      actingCredits: true,
      dops: true,
      editors: true,
      composers: true,
      genres: true,
      productionCompanies: true,
      distributionCompanies: true,
      reviews: {
        include: { author: true },
        take: 5,
        orderBy: { thankCount: 'desc' },
      },
      viewedUsers: req.user ? { where: { id: req.user.id } } : undefined,
    },
  });

  let isViewed = undefined;
  if (req.user) {
    isViewed = result?.viewedUsers.length === 1;
  }

  res.json({ ...result, viewedUsers: undefined, isViewed });
}

export async function markMovieAsViewed(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const movieId = +req.params.id;
  const user = req.user;

  if (!user) {
    throw new Error('User does not exist in request');
  }

  const movie = await prismaClient.movie.findUnique({
    where: {
      id: movieId,
    },
    include: { viewedUsers: { where: { id: user.id } } },
  });
  if (!movie) {
    return next(new HttpNotFoundError('Movie not found'));
  }

  let result;
  let isViewed;
  if (movie.viewedUsers.length === 0) {
    result = await prismaClient.movie.update({
      where: {
        id: movieId,
      },
      data: {
        viewedUsers: { connect: { id: user.id } },
        viewedUserCount: { increment: 1 },
      },
    });
    isViewed = true;
  } else {
    result = await prismaClient.movie.update({
      where: {
        id: movieId,
      },
      data: {
        viewedUsers: { disconnect: { id: user.id } },
        viewedUserCount: { decrement: 1 },
      },
    });
    isViewed = false;
  }

  res.json({ ...result, isViewed });
}
