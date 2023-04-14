import { Request, Response } from 'express';
import { prismaClient } from '../db';
import { User } from '@prisma/client';

export async function getReviewsOfMovie(req: Request, res: Response) {
  const movieId = +req.params.id;
  const limit = req.query.limit;
  const offset = req.query.offset;
  const orderBy = req.query.orderBy;
  const asc = req.query.orderBy;
  const orderDirection = asc === 'true' ? 'asc' : 'desc';

  const result = await prismaClient.review.findMany({
    where: {
      movieId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          criticUser: true,
          regularUser: true,
        },
      },
    },
    take: limit ? +limit : undefined,
    skip: offset ? +offset : undefined,
    orderBy: {
      thankCount: orderBy === 'thankCount' ? orderDirection : undefined,
      postTime: orderBy === 'postTime' ? orderDirection : undefined,
      score: orderBy === 'score' ? orderDirection : undefined,
    },
  });

  res.json(result);
}

export async function getReview(req: Request, res: Response) {
  const reviewId = +req.params.id;

  const result = await prismaClient.review.findUnique({
    where: {
      id: reviewId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          criticUser: true,
          regularUser: true,
        },
      },
      movie: true,
    },
  });

  res.json(result);
}

export async function postReviewOfMovie(req: Request, res: Response) {
  const movieId = +req.params.id;
  const author = req.user as User;
  const title = req.body.title as string;
  const content = req.body.content as string;
  const score = +(req.body.score as string);

  const result = await prismaClient.review.create({
    data: {
      authorId: author.id,
      movieId,
      title,
      content,
      score,
    },
  });

  res.json(result);
}
