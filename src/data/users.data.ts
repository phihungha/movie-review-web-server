import { prismaClient } from '../api-clients';

export async function getUserViewedMovies(userId: number) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { viewedMovies: true },
  });
  return result?.viewedMovies;
}

export async function getUserReviews(userId: number) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { reviews: true },
  });
  return result?.reviews;
}

export async function getUserThankedReviews(userId: number) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { reviewThanks: true },
  });
  return result?.reviewThanks;
}
