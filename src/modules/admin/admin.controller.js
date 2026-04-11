const prisma = require("../../config/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const { isPrimaryAdmin } = require("../../utils/adminAccess");

const getVehiclesGlobalStatus = asyncHandler(async (_req, res) => {
  const [statusCount, vehicles] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ["currentStatus"],
      _count: {
        _all: true,
      },
    }),
    prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { photos: true },
        },
      },
    }),
  ]);

  return res.json({
    summary: statusCount.map((item) => ({
      status: item.currentStatus,
      total: item._count._all,
    })),
    vehicles,
  });
});

const listOperators = asyncHandler(async (_req, res) => {
  const operators = await prisma.user.findMany({
    where: { role: "OPERADOR" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          vehicles: true,
          statusUpdates: true,
          photos: true,
        },
      },
    },
  });

  return res.json(operators);
});

const listAdministrators = asyncHandler(async (req, res) => {
  if (!isPrimaryAdmin(req.user)) {
    throw new ApiError(403, "No tienes permisos para ver administradores");
  }

  const administrators = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          vehicles: true,
          statusUpdates: true,
          photos: true,
        },
      },
    },
  });

  return res.json(administrators);
});

module.exports = {
  getVehiclesGlobalStatus,
  listOperators,
  listAdministrators,
};
