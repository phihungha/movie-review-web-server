import { NextFunction, Request, Response } from 'express';
import { getReviewsByUserId } from '../data/users.data';
import { getViewedMoviesByUserId } from '../data/users.data';
import { getThankedReviewsByUserId } from '../data/users.data';
import { HttpBadRequest, HttpNotFoundError } from '../http-errors';
import { Gender, Prisma, UserType } from '@prisma/client';
import { prismaClient } from '../db';
import * as bcrypt from 'bcrypt';

function getGenderFromReqParam(genderParam: any): Gender | undefined {
  switch (genderParam as 'male' | 'female' | 'other' | undefined) {
    case 'male':
      return Gender.Male;
    case 'female':
      return Gender.Female;
    case 'other':
      return Gender.Other;
    case undefined:
      return undefined;
    default:
      throw new Error('Invalid gender param value');
  }
}

function getUserTypeFromReqParam(typeParam: any): UserType {
  switch (typeParam) {
    case 'regular':
      return UserType.Regular;
    case 'critic':
      return UserType.Critic;
    default:
      throw new Error('Invalid user type param value');
  }
}

async function generateHashedPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = getGenderFromReqParam(req.body.gender);
  const newHashedPassword = await generateHashedPassword(req.body.password);
  const userType = getUserTypeFromReqParam(req.body.type);

  let userTypeData;
  if (userType === UserType.Critic) {
    userTypeData = {
      criticUser: { create: { blogUrl } },
    };
  } else {
    userTypeData = {
      regularUser: { create: {} },
    };
  }

  try {
    const result = await prismaClient.user.create({
      data: {
        username,
        email,
        hashedPassword: newHashedPassword,
        name,
        gender,
        dateOfBirth,
        userType,
        ...userTypeData,
      },
    });
    const { hashedPassword, ...sanitizedResult } = result;
    res.json(sanitizedResult);
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

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = +req.params.id;
  const username = req.body.username;
  const email = req.body.email;
  const name = req.body.name;
  const dateOfBirth = req.body.dateOfBirth;
  const blogUrl = req.body.blogUrl;
  const gender = getGenderFromReqParam(req.body.gender);

  let newHashedPassword;
  if (req.body.password) {
    newHashedPassword = await generateHashedPassword(req.body.password);
  }

  let userTypeData;
  if (blogUrl) {
    userTypeData = {
      criticUser: {
        update: { blogUrl },
      },
    };
  }

  try {
    const result = await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        email,
        hashedPassword: newHashedPassword,
        name,
        gender,
        dateOfBirth,
        ...userTypeData,
      },
    });
    const { hashedPassword, ...sanitizedResult } = result;
    res.json(sanitizedResult);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      next(
        new HttpNotFoundError("User not found or user type doesn't support."),
      );
    } else {
      next(err);
    }
  }
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
