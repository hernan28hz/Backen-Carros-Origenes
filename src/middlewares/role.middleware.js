const ApiError = require("../utils/apiError");

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Insufficient permissions"));
  }

  return next();
};

module.exports = requireRole;
