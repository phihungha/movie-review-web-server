import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '../api-clients';
import { HttpNotFoundError } from '../http-errors';

export async function getMovies(req: Request, res: Response) {
  const searchTerm = req.query.searchTerm as string | undefined;
  const limit = req.query.limit as number | undefined;
  const offset = req.query.offset as number | undefined;
  const releaseYear = req.query.releaseYear as number | undefined;
  const minRegularScore = req.query.minRegularScore as number | undefined;
  const maxRegularScore = req.query.maxRegularScore as number | undefined;
  const minCriticScore = req.query.minCriticScore as number | undefined;
  const maxCriticScore = req.query.maxCriticScore as number | undefined;
  const orderBy = req.query.orderBy;
  const asc = req.query.asc as boolean | undefined;
  const orderDirection = asc ? 'asc' : 'desc';

  const result = await prismaClient.movie.findMany({
    where: {
      title: { contains: searchTerm, mode: 'insensitive' },
      regularScore: { gte: minRegularScore, lte: maxRegularScore },
      criticScore: { gte: minCriticScore, lte: maxCriticScore },
      releaseDate: releaseYear
        ? {
            gte: new Date(releaseYear, 1, 1),
            lte: new Date(releaseYear, 12, 31),
          }
        : undefined,
    },
    orderBy: {
      releaseDate: orderBy === 'releaseDate' ? orderDirection : undefined,
      criticScore: orderBy === 'criticScore' ? orderDirection : undefined,
      regularScore: orderBy === 'regularScore' ? orderDirection : undefined,
      viewedUserCount:
        orderBy === 'viewedUserCount' ? orderDirection : undefined,
    },
    take: limit,
    skip: offset,
  });
  res.json(result);
}

export async function getRecentMovies(_: Request, res: Response) {
  const result = await prismaClient.movie.findMany({
    orderBy: { releaseDate: 'desc' },
    take: 30,
  });
  res.json(result);
}

function calcTrendingDateLimit(): Date {
  const today = new Date();
  today.setDate(-7);
  return today;
}

export async function getTrendingMovies(_: Request, res: Response) {
  const result = await prismaClient.movie.findMany({
    where: {
      releaseDate: { gte: calcTrendingDateLimit() },
    },
    orderBy: {
      viewedUserCount: 'desc',
    },
    take: 30,
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
      actingCredits: {
        include: { crew: true },
      },
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
