export class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class HttpNotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class HttpForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}
