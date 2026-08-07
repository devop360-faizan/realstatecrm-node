const multer = require("multer");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

// Store files in RAM buffer before uploading to S3
const storage = multer.memoryStorage();

// File filter (Images, PDFs, Docs)
const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid file format. Only JPG, PNG, WEBP, PDF, DOC, DOCX files are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (process.env.UPLOAD_MAX_SIZE_MB || 10) * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
