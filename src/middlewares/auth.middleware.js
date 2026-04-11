const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization token");
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "User not authorized");
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;
