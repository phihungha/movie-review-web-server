import { PutObjectCommand } from '@aws-sdk/client-s3';
import { prismaClient } from '../db-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { imageService } from '../image-service';

export async function getUserDetails(userId: string) {
  return await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      viewedMovies: { take: 3 },
      reviews: { take: 3, include: { author: true } },
      reviewThanks: { take: 3, include: { author: true } },
    },
  });
}

export async function getUserViewedMovies(userId: string) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { viewedMovies: true },
  });
  return result?.viewedMovies;
}

export async function getUserReviews(userId: string) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { reviews: { include: { author: true } } },
  });
  return result?.reviews;
}

export async function getUserThankedReviews(userId: string) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { reviewThanks: { include: { author: true } } },
  });
  return result?.reviewThanks;
}

export async function getAvatarUploadUrl(userId: string) {
  return await imageService.getProfileImageUploadUrl(userId);
}
