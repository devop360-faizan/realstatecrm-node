const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const s3Service = require("../services/s3.service");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

class UploadController {
  /**
   * Upload single file to S3
   * @route POST /api/v1/upload/single
   */
  uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No file uploaded");
    }

    const folder = req.body.folder || "uploads";
    const uploadedFile = await s3Service.uploadFile(req.file, folder);

    return ApiResponse.success(res, uploadedFile, "File uploaded successfully to S3", 201);
  });

  /**
   * Upload multiple files to S3
   * @route POST /api/v1/upload/multiple
   */
  uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No files uploaded");
    }

    const folder = req.body.folder || "uploads";
    const uploadPromises = req.files.map((file) => s3Service.uploadFile(file, folder));
    const uploadedFiles = await Promise.all(uploadPromises);

    return ApiResponse.success(res, uploadedFiles, "Multiple files uploaded to S3", 201);
  });
}

module.exports = new UploadController();
