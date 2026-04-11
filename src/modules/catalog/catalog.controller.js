const prisma = require("../../config/prisma");
const asyncHandler = require("../../utils/asyncHandler");

const listPublicVehicles = asyncHandler(async (_req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
      assignedOperator: true,
      currentStatus: true,
      photos: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          url: true,
          description: true,
        },
      },
    },
  });

  return res.json(
    vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      operatorName: vehicle.assignedOperator || null,
      currentStatus: vehicle.currentStatus,
      photoUrl: vehicle.photos[0]?.url || null,
      photoDescription: vehicle.photos[0]?.description || null,
    }))
  );
});

module.exports = {
  listPublicVehicles,
};
