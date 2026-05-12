class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation Failed') {
        super(message, 400);
    }
}

module.exports = {
    AppError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ValidationError,
};