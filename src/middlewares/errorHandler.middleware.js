const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const { StatusCodes } = require('http-status-codes');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Fallback
  return ApiResponse.error(res, err.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
};

module.exports = errorHandler;
