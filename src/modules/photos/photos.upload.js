const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");
const ApiError = require("../../utils/apiError");

const uploadDir = path.join(process.cwd(), "uploads", "vehicles");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "");
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new ApiError(400, "Only image files are allowed"));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

module.exports = upload;
