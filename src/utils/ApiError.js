const { StatusCodes } = require('http-status-codes');

class ApiError extends Error {
  constructor(statusCode = StatusCodes.INTERNAL_SERVER_ERROR, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
