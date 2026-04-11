const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/prisma");
const env = require("../../config/env");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { normalizeIdentifier } = require("../../utils/identity");

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const normalizedIdentifier = normalizeIdentifier(identifier);

  const user = await prisma.user.findUnique({
    where: { email: normalizedIdentifier },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = {
  login,
};
