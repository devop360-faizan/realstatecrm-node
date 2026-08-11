const jwt = require("jsonwebtoken");
const prisma = require("../config/db.config");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { StatusCodes } = require("http-status-codes");

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Access token missing or invalid",
    );
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "CHANGE_ME_32_CHARS_ACCESS_SECRET_HERE",
    );
  } catch (err) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired access token",
    );
  }

  const userId = payload.sub || payload.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found or suspended");
  }

  if (!user.refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expired or user logged out");
  }

  delete user.password;
  delete user.refreshToken;

  req.user = user;
  req.agencyId = user.agencyId;
  next();
});

module.exports = authenticate;
