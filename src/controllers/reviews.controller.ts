import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '../api-clients';
import { Gender } from '@prisma/client';
import { HttpBadRequest, HttpNotFoundError } from '../http-errors';
import { DbErrHandlerChain } from '../db-errors';
import {
  calcAvgReviewScoreByRegularsAge,
  calcAvgReviewScoreByRegularsGender,
  updateAggregateData,
} from '../data/reviews.data';

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

export async function getReviewBreakdown(req: Request, res: Response) {
  const movieId = +req.params.id;

  const result = await prismaClient.review.groupBy({
    by: ['score'],
    where: { movieId },
    _count: { id: true },
  });
  const reviewCountsByScore = result.reduce(
    (output, item) =>
      Object.assign(output, output, { [item.score]: item._count.id }),
    {},
  );

  res.json({
    reviewCountByScore: reviewCountsByScore,
    avgScoresByRegularsGender: {
      male: await calcAvgReviewScoreByRegularsGender(movieId, Gender.Male),
      female: await calcAvgReviewScoreByRegularsGender(movieId, Gender.Female),
    },
    avgScoresByRegularsAge: {
      '14-20': await calcAvgReviewScoreByRegularsAge(movieId, 14, 20),
      '21-30': await calcAvgReviewScoreByRegularsAge(movieId, 21, 30),
      '31-49': await calcAvgReviewScoreByRegularsAge(movieId, 31, 49),
      '50-Above': await calcAvgReviewScoreByRegularsAge(movieId, 50),
    },
  });
}

export async function postReviewOfMovie(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const movieId = +req.params.id;
  const title = req.body.title;
  const content = req.body.content;
  const score = req.body.score as number;

  const author = req.user;
  if (!author) {
    throw new Error('User does not exist in request');
  }

  const existingReviews = await prismaClient.review.findMany({
    where: { authorId: author.id, movieId: movieId },
  });
  if (existingReviews.length !== 0) {
    next(
      new HttpBadRequest(
        "You've already made a review for this movie. Please edit it instead of making a new one",
      ),
    );
    return;
  }

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
      await updateAggregateData(client, review);
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
  const score = req.body.score;

  try {
    const result = await prismaClient.review.update({
      where: { id: reviewId },
      data: { title, content, score },
    });
    await updateAggregateData(prismaClient, result);
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
        where: { id: reviewId },
      });
      await updateAggregateData(client, review);
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
  const user = req.user;

  if (!user) {
    throw new Error('User does not exist in request');
  }

  const result = await prismaClient.$transaction(async (client) => {
    const review = await client.review.findUnique({
      where: { id: reviewId },
      include: {
        thankUsers: {
          where: { id: user.id },
        },
      },
    });

    if (!review) {
      return next(new HttpNotFoundError('Review not found'));
    }

    if (review.thankUsers.length === 0) {
      return await client.review.update({
        where: { id: reviewId },
        data: {
          thankUsers: { connect: { id: user.id } },
          thankCount: { increment: 1 },
        },
      });
    }
    return await client.review.update({
      where: { id: reviewId },
      data: {
        thankUsers: { disconnect: { id: user.id } },
        thankCount: { decrement: 1 },
      },
    });
  });
  res.json(result);
}
