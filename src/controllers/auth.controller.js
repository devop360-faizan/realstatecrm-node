const asyncHandler = require("../utils/asyncHandler");
const AuthService = require("../services/auth.service");
const S3Service = require("../services/s3.service");
const ApiResponse = require("../utils/ApiResponse");

class AuthController {
  /**
   * @route POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, "Login successful");
  });

  /**
   * @route GET /api/v1/auth/me
   */
  me = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, req.user, "Profile retrieved");
  });

  logout = asyncHandler(async (req, res) => {
    await AuthService.logout(req.user.id);
    return ApiResponse.success(res, null, "Logout successful");
  });

  /**
   * @route PUT /api/v1/auth/me
   */
  updateProfile = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    
    // Handle Avatar File Upload
    if (req.file) {
      const uploadResult = await S3Service.uploadFile(req.file, "avatars");
      data.avatar = uploadResult.url;
    }

    const updatedUser = await AuthService.updateProfile(req.user.id, data);
    return ApiResponse.success(res, updatedUser, "Profile updated successfully");
  });

  /**
   * @route PUT /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    await AuthService.changePassword(req.user.id, req.body);
    return ApiResponse.success(res, null, "Password changed successfully");
  });
}

module.exports = new AuthController();
