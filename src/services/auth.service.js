const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db.config");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

class AuthService {
  /**
   * Admin / User Login
   */
  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { agency: true },
    });

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Your account is suspended. Contact administrator.",
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    // Generate Compact JWT Tokens
    const tokens = this._generateTokens(user);

    // Update lastSeen and refreshToken in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSeen: new Date(),
        refreshToken: tokens.refreshToken,
      },
    });

    delete user.password;
    delete user.refreshToken;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        agencyId: user.agencyId,
        agencyName: user.agency?.name || null,
        avatar: user.avatar,
        lastSeen: new Date(),
      },
      tokenType: "Bearer",
      ...tokens,
    };
  }

  // Compact Payload Generator for shorter JWT strings
  _generateTokens(user) {
    const payload = {
      sub: user.id,
      r: user.role,
      aid: user.agencyId || null,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET || "CHANGE_ME_32_CHARS_ACCESS_SECRET_HERE",
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || "7d" },
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET ||
        "CHANGE_ME_32_CHARS_REFRESH_SECRET_HERE",
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || "30d" },
    );

    return { accessToken, refreshToken };
  }

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
      },
    });
  }

  async updateProfile(userId, data) {
    const { name, avatar } = data || {};
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    delete updatedUser.password;
    delete updatedUser.refreshToken;
    return updatedUser;
  }

  async changePassword(userId, data) {
    const { currentPassword, newPassword, confirmPassword } = data || {};
    
    if (newPassword !== confirmPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "New password and confirm password do not match");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Incorrect current password");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}

module.exports = new AuthService();
