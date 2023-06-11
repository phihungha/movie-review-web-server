import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../http-errors';

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const errors = { errors: [{ name: err.name, msg: err.message }] };
  if (err instanceof HttpError) {
    res.status(err.statusCode).json(errors);
  } else {
    res.status(500).json(errors);
  }
}
