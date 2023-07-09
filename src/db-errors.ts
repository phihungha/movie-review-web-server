import { Prisma } from '@prisma/client';
import { NextFunction } from 'express';
import { HttpBadRequest, HttpNotFoundError } from './http-errors';

/**
 * Xử lý exception từ database client (Prisma) để throw HttpException phù hợp.
 * Dùng Chain of Responsibility, Template method, Builder.
 */

/**
 * Base class cho Chain of Responsibility.
 * Mỗi lớp ErrorHandler sẽ kiểm tra lỗi có xử lý được không,
 * nếu được thì xử lý (bằng cách throw HttpException),
 * không thì chuyển cho ErrorHandler tiếp theo.
 */
abstract class DbErrorHandler {
  constructor(public message?: string, public nextHandler?: DbErrorHandler) {}

  /**
   * Cách xử lý của mỗi ErrorHandler chỉ khác nhau về
   * điều kiện lỗi và exception được throw lại
   * nên dùng template method ở đây để các lớp con override
   * chỗ check lỗi và throw lại.
   */
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

// Xử lý lỗi không tìm thấy ID
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

// Xử lý lỗi vi phạm unique constraint
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

/**
 * Chuỗi chain of responsibility các ErrorHandler được tạo ra
 * dùng builder pattern. Ở chỗ này bản thân cái lớp vừa là
 * product vừa là builder luôn cơ mà muốn tách ra cũng được.
 */
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
