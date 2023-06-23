import { PutObjectCommand } from '@aws-sdk/client-s3';
import { prismaClient, s3Client } from '../api-clients';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    include: { reviews: true },
  });
  return result?.reviews;
}

export async function getUserThankedReviews(userId: string) {
  const result = await prismaClient.user.findUnique({
    where: { id: userId },
    include: { reviewThanks: true },
  });
  return result?.reviewThanks;
}

export async function getAvatarUploadUrl(userId: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `'public/userProfileImages/${userId}.webp`,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
