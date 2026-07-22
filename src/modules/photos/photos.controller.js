const fs = require("node:fs/promises");
const path = require("node:path");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { createAuditLog } = require("../../services/auditLog");

const uploadDir = path.join(process.cwd(), "uploads", "vehicles");

const uploadVehiclePhoto = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Photo is required");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const photo = await prisma.$transaction(async (tx) => {
    const createdPhoto = await tx.vehiclePhoto.create({
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

    await createAuditLog(
      {
        userId: req.user.id,
        action: "CREATE",
        entity: "VehiclePhoto",
        entityId: createdPhoto.id,
        newValue: createdPhoto,
      },
      tx
    );

    return createdPhoto;
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

  await prisma.$transaction(async (tx) => {
    await tx.vehiclePhoto.delete({
      where: { id: photo.id },
    });

    await createAuditLog(
      {
        userId: req.user.id,
        action: "DELETE",
        entity: "VehiclePhoto",
        entityId: photo.id,
        oldValue: photo,
      },
      tx
    );
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
