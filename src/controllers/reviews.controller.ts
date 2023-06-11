import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '../api-clients';
import { Review, User, UserType } from '@prisma/client';
import { HttpNotFoundError } from '../http-errors';
import { PrismaTxClient } from '../types';
import { DbErrHandlerChain } from '../db-errors';

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

async function updateAggregateData(
  review: Review,
  authorType: UserType,
  prismaClient: PrismaTxClient,
) {
  const reviewAggregates = await prismaClient.review.aggregate({
    _avg: {
      score: true,
    },
    _count: {
      id: true,
    },
    where: {
      movieId: review.movieId,
      authorType,
    },
  });
  const averageScore = reviewAggregates._avg.score;
  const reviewCount = reviewAggregates._count.id;

  let updateData;
  if (authorType === UserType.Regular) {
    updateData = {
      regularScore: averageScore,
      regularReviewCount: reviewCount,
    };
  } else {
    updateData = {
      criticScore: averageScore,
      criticReviewCount: reviewCount,
    };
  }

  await prismaClient.movie.update({
    where: {
      id: review.movieId,
    },
    data: updateData,
  });
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

  const newReview = await prismaClient.$transaction(async (client) => {
    try {
      const review = await client.review.create({
        data: {
          author: { connect: { id: author.id } },
          authorType: author.userType,
          movie: { connect: { id: movieId } },
          title,
          content,
          score,
        },
      });
      await updateAggregateData(review, review.authorType, client);
      res.json(review);
    } catch (err) {
      DbErrHandlerChain.new().notFound().handle(err, next);
    }
  });
  return newReview;
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
    DbErrHandlerChain.new().notFound().handle(err, next);
  }
}

export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const reviewId = +req.params.id;

  const deletedReview = await prismaClient.$transaction(async (client) => {
    try {
      const review = await client.review.delete({
        where: {
          id: reviewId,
        },
      });
      await updateAggregateData(review, review.authorType, client);
      res.json(review);
    } catch (err) {
      DbErrHandlerChain.new().notFound().handle(err, next);
    }
  });
  return deletedReview;
}

export async function thankReview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const reviewId = +req.params.id;
  const user = req.user as User;

  const result = await prismaClient.$transaction(async (client) => {
    const review = await client.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        thankUsers: {
          where: {
            id: user.id,
          },
        },
      },
    });

    if (!review) {
      return next(new HttpNotFoundError('Review not found'));
    }

    if (review.thankUsers.length === 0) {
      return await client.review.update({
        where: {
          id: reviewId,
        },
        data: {
          thankUsers: { connect: { id: user.id } },
          thankCount: { increment: 1 },
        },
      });
    }
    return await client.review.update({
      where: {
        id: reviewId,
      },
      data: {
        thankUsers: { disconnect: { id: user.id } },
        thankCount: { decrement: 1 },
      },
    });
  });
  res.json(result);
}
