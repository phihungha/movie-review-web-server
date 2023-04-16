import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '../db';
import { User } from '@prisma/client';
import { HttpNotFoundError } from '../http-errors';
import { Prisma } from '@prisma/client';

export async function getReviewsOfMovie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const movieId = +req.params.id;
  const limit = req.query.limit as number | undefined;
  const offset = req.query.offset as number | undefined;
  const orderBy = req.query.orderBy;
  const asc = req.query.asc as boolean | undefined;
  const orderDirection = asc ? 'asc' : 'desc';

  const result = await prismaClient.movie.findUnique({
    where: {
      id: movieId,
    },
    include: {
      reviews: {
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
        take: limit ? limit : undefined,
        skip: offset ? offset : undefined,
        orderBy: {
          thankCount: orderBy === 'thankCount' ? orderDirection : undefined,
          postTime: orderBy === 'postTime' ? orderDirection : undefined,
          score: orderBy === 'score' ? orderDirection : undefined,
        },
      },
    },
  });

  if (!result) {
    next(new HttpNotFoundError('Movie not found'));
  } else {
    res.json(result.reviews);
  }
}

export async function getReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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

  if (!result) {
    next(new HttpNotFoundError('Review not found'));
  } else {
    res.json(result);
  }
}

export async function postReviewOfMovie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const movieId = +req.params.id;
  const author = req.user as User;
  const title = req.body.title;
  const content = req.body.content;
  const score = req.body.score as number;

  try {
    const result = await prismaClient.review.create({
      data: {
        author: { connect: { id: author.id } },
        movie: { connect: { id: movieId } },
        title,
        content,
        score,
      },
    });
    res.json(result);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      next(new HttpNotFoundError('Movie not found'));
    } else {
      next(err);
    }
  }
}

export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const reviewId = +req.params.id;
  const title = req.body.title;
  const content = req.body.content;

  try {
    const result = await prismaClient.review.update({
      where: {
        id: reviewId,
      },
      data: {
        title,
        content,
      },
    });
    res.json(result);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      next(new HttpNotFoundError('Review not found'));
    } else {
      next(err);
    }
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const reviewId = +req.params.id;
  try {
    const result = await prismaClient.review.delete({
      where: {
        id: reviewId,
      },
    });
    res.json(result);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      next(new HttpNotFoundError('Review not found'));
    } else {
      next(err);
    }
  }
}
