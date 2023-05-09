import { NextFunction, Request, Response } from 'express';
import { getReviewsByUserId } from '../data/users.data';
import { getViewedMoviesByUserId } from '../data/users.data';
import { getThankedReviewsByUserId } from '../data/users.data';
import { HttpBadRequest, HttpNotFoundError } from '../http-errors';
import { Gender, Prisma, UserType, User } from '@prisma/client';
import { prismaClient } from '../db';
import * as bcrypt from 'bcrypt';

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  const email = req.body.email;
  const type = req.body.type as 'Regular' | 'Critic';
  const password = req.body.password;
  const name = req.body.name;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;

  let gender: Gender | undefined;
  switch (req.body.gender as 'male' | 'female' | 'other' | undefined) {
    case 'male':
      gender = Gender.Male;
      break;
    case 'female':
      gender = Gender.Female;
      break;
    case 'other':
      gender = Gender.Other;
      break;
    default:
      gender = undefined;
  }

  const salt = await bcrypt.genSalt();
  const hashedNewPassword = await bcrypt.hash(password, salt);

  try {
    const result = await prismaClient.user.create({
      data: {
        username,
        email,
        hashedPassword: hashedNewPassword,
        name,
        gender,
        dateOfBirth,
        userType: type === 'Regular' ? UserType.Regular : UserType.Critic,
        regularUser: type === 'Regular' ? { create: {} } : undefined,
        criticUser: type === 'Critic' ? { create: { blogUrl } } : undefined,
      },
    });
    const { hashedPassword, ...sanitizedResult } = result;
    res.json({ sanitizedResult });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      next(new HttpBadRequest(`${err.meta?.target} already exists`));
    } else {
      next(err);
    }
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = +req.params.id;
  const result = await prismaClient.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!result) {
    return next(new HttpNotFoundError('User not found'));
  }

  const { hashedPassword, ...sanitizedResult } = result;
  res.json(sanitizedResult);
}

export async function getViewedMoviesOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = +req.params.id;
  const result = await getViewedMoviesByUserId(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}

export async function getReviewsOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = +req.params.id;
  const result = await getReviewsByUserId(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}

export async function getThankedReviewsOfUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = +req.params.id;
  const result = await getThankedReviewsByUserId(userId);
  if (!result) {
    next(new HttpNotFoundError('User not found'));
  } else {
    res.json(result);
  }
}
