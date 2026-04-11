const fs = require("node:fs/promises");
const path = require("node:path");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");

const uploadDir = path.join(process.cwd(), "uploads", "vehicles");

const uploadVehiclePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Photo is required");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, createdById: true },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (req.user.role !== "ADMIN" && vehicle.createdById !== req.user.id) {
    throw new ApiError(403, "You do not have access to upload photos for this vehicle");
  }

  const photo = await prisma.vehiclePhoto.create({
    data: {
      vehicleId: id,
      url: `/uploads/vehicles/${req.file.filename}`,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      description,
      uploadedById: req.user.id,
    },
  });

  return res.status(201).json(photo);
});

const deleteVehiclePhoto = asyncHandler(async (req, res) => {
  const { id, photoId } = req.params;

  const photo = await prisma.vehiclePhoto.findUnique({
    where: { id: photoId },
    include: {
      vehicle: {
        select: { id: true, createdById: true },
      },
    },
  });

  if (!photo || photo.vehicleId !== id) {
    throw new ApiError(404, "Photo not found");
  }

  const canDelete =
    req.user.role === "ADMIN" || photo.uploadedById === req.user.id || photo.vehicle.createdById === req.user.id;

  if (!canDelete) {
    throw new ApiError(403, "You do not have access to delete this photo");
  }

  await prisma.vehiclePhoto.delete({
    where: { id: photo.id },
  });

  const filePath = path.join(uploadDir, photo.fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return res.json({ message: "Photo deleted successfully", id: photo.id });
});

module.exports = {
  uploadVehiclePhoto,
  deleteVehiclePhoto,
};
