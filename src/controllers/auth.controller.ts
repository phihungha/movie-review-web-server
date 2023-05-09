import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prismaClient } from '../db';
import * as bcrypt from 'bcrypt';
import { HttpForbiddenError } from '../http-errors';

export async function login(req: Request, res: Response, next: NextFunction) {
  const username = req.body.username;
  const password = req.body.password;
  const users = await prismaClient.user.findMany({
    where: {
      OR: [{ username }, { email: username }],
    },
  });

  if (users.length === 0) {
    return next(new HttpForbiddenError('Username or password is incorrect'));
  }

  const user = users[0];

  if (!(await bcrypt.compare(password, user.hashedPassword))) {
    return next(new HttpForbiddenError('Username or password is incorrect'));
  }

  const jwtPayload = { username: user.username, sub: user.id };
  if (!process.env.JWT_SECRET) {
    throw Error('No JWT_SECRET configured as environment variable.');
  }
  const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET);
  res.json({ jwt: jwtToken });
}
