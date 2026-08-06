const { StatusCodes } = require('http-status-codes');

class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = StatusCodes.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = 'Error', statusCode = StatusCodes.INTERNAL_SERVER_ERROR, errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length ? errors : undefined,
    });
  }
}

module.exports = ApiResponse;
