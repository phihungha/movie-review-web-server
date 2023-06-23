import { Gender, Review, UserType } from '@prisma/client';
import { prismaClient } from '../api-clients';
import { calcDateOfBirthFromAge } from '../utils';
import { PrismaTxClient } from '../types';

export async function calcAvgReviewScoreByRegularsGender(
  movieId: number,
  gender: Gender,
): Promise<number | null> {
  const result = await prismaClient.review.aggregate({
    _avg: {
      score: true,
    },
    where: {
      movieId,
      authorType: UserType.Regular,
      author: {
        gender,
      },
    },
  });
  return result._avg.score;
}

export async function calcAvgReviewScoreByRegularsAge(
  movieId: number,
  minAge?: number,
  maxAge?: number,
): Promise<number | null> {
  const result = await prismaClient.review.aggregate({
    _avg: { score: true },
    where: {
      movieId,
      authorType: UserType.Regular,
      author: {
        dateOfBirth: {
          lte: minAge ? calcDateOfBirthFromAge(minAge) : undefined,
          gte: maxAge ? calcDateOfBirthFromAge(maxAge) : undefined,
        },
      },
    },
  });
  return result._avg.score;
}

export async function updateAggregateData(
  review: Review,
  authorType: UserType,
  prismaClient: PrismaTxClient,
) {
  const reviewAggregates = await prismaClient.review.aggregate({
    _avg: { score: true },
    _count: { id: true },
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
    where: { id: review.movieId },
    data: updateData,
  });
}
