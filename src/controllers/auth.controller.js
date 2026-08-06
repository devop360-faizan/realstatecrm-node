const asyncHandler = require('../utils/asyncHandler');
const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  /**
   * @route POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  });

  /**
   * @route GET /api/v1/auth/me
   */
  me = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, req.user, 'Profile retrieved');
  });
}

module.exports = new AuthController();
