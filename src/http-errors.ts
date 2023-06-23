export class HttpError extends Error {
  statusCode: number;
  name = 'HttpError';
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class HttpNotFoundError extends HttpError {
  name = 'HttpNotFoundError';
  constructor(message: string = 'Not found') {
    super(404, message);
  }
}

export class HttpForbiddenError extends HttpError {
  name = 'HttpForbiddenError';
  constructor(message: string = 'Unauthorized') {
    super(403, message);
  }
}

export class HttpBadRequest extends HttpError {
  name = 'HttpBadRequest';
  constructor(message: string = 'Bad request') {
    super(400, message);
  }
}
