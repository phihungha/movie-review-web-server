import { Request, Response } from 'express';
import { prismaClient } from '../db';

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
      actors: true,
      dops: true,
      editors: true,
      composers: true,
      genres: true,
      productionCompanies: true,
      distributionCompanies: true,
      reviews: {
        include: {
          author: true,
        },
        take: 3,
        orderBy: {
          thankCount: 'desc',
        },
      },
    },
  });
  res.json(result);
}
