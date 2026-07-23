const prisma = require("../../config/prisma");
const asyncHandler = require("../../utils/asyncHandler");

const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;
const PUBLIC_CATALOG_CACHE_SECONDS = Number(process.env.PUBLIC_CATALOG_CACHE_SECONDS || THREE_DAYS_IN_SECONDS);
const PUBLIC_CATALOG_STALE_SECONDS = Number(process.env.PUBLIC_CATALOG_STALE_SECONDS || THREE_DAYS_IN_SECONDS);

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
  res.setHeader(
    "Cache-Control",
    `public, max-age=${PUBLIC_CATALOG_CACHE_SECONDS}, stale-while-revalidate=${PUBLIC_CATALOG_STALE_SECONDS}`
  );
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
