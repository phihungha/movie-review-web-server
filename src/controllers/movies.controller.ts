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
