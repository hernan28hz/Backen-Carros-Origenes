const { Prisma } = require("@prisma/client");
const multer = require("multer");
const ApiError = require("../utils/apiError");

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details || undefined,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Duplicate value on unique field" });
    }
  }

  // eslint-disable-next-line no-console
  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
  });
};

module.exports = errorMiddleware;
