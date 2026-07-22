const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { createAuditLog } = require("../../services/auditLog");

const updateVehicleStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { statusType, description } = req.body;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, currentStatus: true },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
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

    await createAuditLog(
      {
        userId: req.user.id,
        action: "UPDATE",
        entity: "Vehicle",
        entityId: id,
        oldValue: { currentStatus: vehicle.currentStatus },
        newValue: { currentStatus: statusType },
        metadata: { description },
      },
      tx
    );

    return history;
  });

  return res.status(200).json(result);
});

module.exports = {
  updateVehicleStatus,
};
