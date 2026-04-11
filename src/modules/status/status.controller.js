const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");

const updateVehicleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { statusType, description } = req.body;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, createdById: true, currentStatus: true },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (req.user.role !== "ADMIN" && vehicle.createdById !== req.user.id) {
    throw new ApiError(403, "You do not have access to update this vehicle");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id },
      data: {
        currentStatus: statusType,
      },
    });

    const history = await tx.vehicleStatusHistory.create({
      data: {
        vehicleId: id,
        statusType,
        description,
        updatedById: req.user.id,
      },
    });

    return history;
  });

  return res.status(200).json(result);
});

module.exports = {
  updateVehicleStatus,
};
