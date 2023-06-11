import { Prisma } from '@prisma/client';
import { NextFunction } from 'express';
import { HttpBadRequest, HttpNotFoundError } from './http-errors';

abstract class DbErrorHandler {
  constructor(public message?: string, public nextHandler?: DbErrorHandler) {}

  handle(error: unknown, nextMiddleware: NextFunction) {
    if (this.checkError(error)) {
      nextMiddleware(this.rethrow(error));
    } else if (this.nextHandler) {
      this.nextHandler.handle(error, nextMiddleware);
    } else {
      nextMiddleware(error);
    }
  }

  abstract checkError(error: unknown): boolean;
  abstract rethrow(error: unknown): Error;
}

export class DbNotFoundErrorHandler extends DbErrorHandler {
  constructor(message?: string, nextHandler?: DbErrorHandler) {
    super(message, nextHandler);
  }

  checkError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }

  rethrow(error: unknown): Error {
    const detailError = error as Prisma.PrismaClientKnownRequestError;
    return new HttpNotFoundError(
      this.message ?? `${detailError.meta?.target} not found`,
    );
  }
}

export class DbUniqueErrorHandler extends DbErrorHandler {
  constructor(message?: string, nextHandler?: DbErrorHandler) {
    super(message, nextHandler);
  }

  checkError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  rethrow(error: unknown): Error {
    const detailError = error as Prisma.PrismaClientKnownRequestError;
    return new HttpBadRequest(
      this.message ?? `${detailError.meta?.target} already exists`,
    );
  }
}

export class DbErrHandlerChain {
  handlers: DbErrorHandler[] = [];

  static new(): DbErrHandlerChain {
    return new DbErrHandlerChain();
  }

  notFound(message?: string): DbErrHandlerChain {
    const nextHandler = this.handlers.at(-1);
    const newHandler = new DbNotFoundErrorHandler(message, nextHandler);
    this.handlers.push(newHandler);
    return this;
  }

  unique(message?: string): DbErrHandlerChain {
    const nextHandler = this.handlers.at(-1);
    const newHandler = new DbUniqueErrorHandler(message, nextHandler);
    this.handlers.push(newHandler);
    return this;
  }

  handle(error: unknown, nextMiddleware: NextFunction) {
    this.handlers.at(-1)?.handle(error, nextMiddleware);
  }
}
