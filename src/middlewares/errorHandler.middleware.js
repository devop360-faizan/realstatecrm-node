const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../utils/logger");
const { StatusCodes } = require("http-status-codes");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

  // Operational API Errors
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Prisma Unique Constraint Error (P2002)
  if (err.code === "P2002") {
    const targetFields = err.meta?.target ? err.meta.target.join(", ") : "field";
    return ApiResponse.error(
      res,
      `A record with this ${targetFields} already exists`,
      StatusCodes.CONFLICT,
    );
  }

  // Handle generic Prisma Client errors cleanly without dumping raw internal stack traces
  if (err.name && err.name.includes("Prisma")) {
    return ApiResponse.error(
      res,
      "Database operation failed. Please check input parameters or schema sync.",
      StatusCodes.BAD_REQUEST,
    );
  }

  // Fallback 500
  return ApiResponse.error(
    res,
    process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};

module.exports = errorHandler;
