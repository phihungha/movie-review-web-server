import { prismaClient } from '../db';

export async function getViewedMoviesByUserId(userId: number) {
  const result = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      viewedMovies: true,
    },
  });
  return result?.viewedMovies;
}

export async function getReviewsByUserId(userId: number) {
  const result = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      reviews: true,
    },
  });
  return result?.reviews;
}

export async function getThankedReviewsByUserId(userId: number) {
  const result = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      reviewThanks: true,
    },
  });
  return result?.reviewThanks;
}
