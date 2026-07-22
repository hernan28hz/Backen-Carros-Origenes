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

  res.removeHeader("Pragma");
  res.removeHeader("Expires");
  res.removeHeader("Surrogate-Control");
  res.removeHeader("CDN-Cache-Control");
  res.removeHeader("Vercel-CDN-Cache-Control");
  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
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
