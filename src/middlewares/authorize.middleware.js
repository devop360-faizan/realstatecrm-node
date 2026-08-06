const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');

/**
 * Role-Based Access Control (RBAC) middleware.
 * Usage: authorize('SUPER_ADMIN') or authorize('SUPER_ADMIN', 'AGENCY_OWNER')
 */
const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, `Access denied. Required role: ${roles.join(' or ')}`);
    }
    next();
  };
};

module.exports = authorize;
