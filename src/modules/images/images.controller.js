const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");

sharp.cache({
  files: Number(process.env.IMAGE_CACHE_FILES || 10),
  memory: Number(process.env.IMAGE_CACHE_MEMORY_MB || 16),
  items: Number(process.env.IMAGE_CACHE_ITEMS || 50),
});
sharp.concurrency(Number(process.env.IMAGE_PROCESSING_CONCURRENCY || 1));

const uploadDir = path.resolve(process.cwd(), "uploads", "vehicles");
const cacheDir = path.resolve(process.cwd(), "uploads", ".cache", "vehicles");
const allowedWidths = [160, 320, 480, 640, 768, 960, 1280];
const variantJobs = new Map();

function sendOriginalImage(res, fileName, filePath) {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.type(path.extname(fileName) || "jpeg");
  return res.sendFile(filePath);
}

function pickWidth(value) {
  const requested = Number.parseInt(value, 10);
  if (!Number.isFinite(requested)) return 640;
  return allowedWidths.reduce((closest, width) =>
    Math.abs(width - requested) < Math.abs(closest - requested) ? width : closest
  );
}

function pickFormat(acceptHeader) {
  const accepts = String(acceptHeader || "");
  if (accepts.includes("image/webp")) return "webp";
  if (process.env.IMAGE_AVIF_ENABLED === "true" && accepts.includes("image/avif")) return "avif";
  return "jpeg";
}

function formatOptions(format) {
  if (format === "avif") return { quality: 50, effort: 4 };
  if (format === "webp") return { quality: 76, effort: 5 };
  return { quality: 78, progressive: true, mozjpeg: true };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (_error) {
    return false;
  }
}

function resolveVehicleImage(fileName) {
  const normalizedName = path.basename(fileName || "");
  if (!normalizedName || normalizedName !== fileName) {
    throw new ApiError(400, "Invalid image name");
  }

  const resolvedPath = path.resolve(uploadDir, normalizedName);
  if (!resolvedPath.startsWith(`${uploadDir}${path.sep}`)) {
    throw new ApiError(400, "Invalid image path");
  }

  return { fileName: normalizedName, filePath: resolvedPath };
}

const serveVehicleImageVariant = asyncHandler(async (req, res) => {
  const { fileName, filePath } = resolveVehicleImage(req.params.fileName);
  const originalStats = await fs.stat(filePath).catch(() => null);
  if (!originalStats || !originalStats.isFile()) {
    throw new ApiError(404, "Image not found");
  }

  if (process.env.IMAGE_OPTIMIZATION_ENABLED === "false") {
    return sendOriginalImage(res, fileName, filePath);
  }

  const width = pickWidth(req.query.w);
  const format = pickFormat(req.headers.accept);
  const parsedName = path.parse(fileName);
  const cacheHash = crypto
    .createHash("sha1")
    .update(`${fileName}:${originalStats.size}:${originalStats.mtimeMs}:${width}:${format}`)
    .digest("hex")
    .slice(0, 12);
  const cachePath = path.join(cacheDir, `${parsedName.name}-${width}-${cacheHash}.${format}`);

  try {
    await fs.mkdir(cacheDir, { recursive: true });
    if (!(await fileExists(cachePath))) {
      const existingJob = variantJobs.get(cachePath);
      if (existingJob) {
        await existingJob;
      } else {
        const job = sharp(filePath)
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .toFormat(format, formatOptions(format))
          .toFile(cachePath)
          .finally(() => {
            variantJobs.delete(cachePath);
          });
        variantJobs.set(cachePath, job);
        await job;
      }
    }
  } catch (error) {
    // If image processing fails in production, keep the catalog usable.
    // eslint-disable-next-line no-console
    console.warn(`Serving original image because optimization failed for ${fileName}:`, error);
    return sendOriginalImage(res, fileName, filePath);
  }

  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Vary", "Accept");
  res.type(`image/${format}`);
  return res.sendFile(cachePath, { dotfiles: "allow" });
});

module.exports = {
  serveVehicleImageVariant,
};
