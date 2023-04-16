import { prismaClient } from '../db';

export async function getViewedMoviesOfUser(userId: number) {
  return await prismaClient.movie.findMany({
    where: {
      viewedUsers: { some: { id: userId } },
    },
  });
}

export async function getReviewsOfUser(userId: number) {
  return await prismaClient.review.findMany({
    where: {
      authorId: userId,
    },
  });
}

export async function getThankedReviewsOfUser(userId: number) {
  return await prismaClient.review.findMany({
    where: {
      thankUsers: { some: { id: userId } },
    },
  });
}
