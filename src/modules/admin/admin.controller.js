const prisma = require("../../config/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const { isPrimaryAdmin, PRIMARY_ADMIN_IDS } = require("../../utils/adminAccess");
const { ROLES } = require("../../utils/permissions");

const vehicleListSelect = {
  id: true,
  plate: true,
  brand: true,
  model: true,
  year: true,
  currentStatus: true,
  assignedOperator: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  statusHistory: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      statusType: true,
      description: true,
      date: true,
      createdAt: true,
      updatedById: true,
    },
  },
  _count: {
    select: { photos: true },
  },
};

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
      select: vehicleListSelect,
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
  const users = await prisma.user.findMany({
    where: { role: { not: ROLES.ADMIN } },
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
          adminUpdates: true,
          photos: true,
          financeRecords: true,
        },
      },
    },
  });

  return res.json(users);
});

const listAdministrators = asyncHandler(async (req, res) => {
  if (!isPrimaryAdmin(req.user)) {
    throw new ApiError(403, "No tienes permisos para ver tecnicos");
  }

  const administrators = await prisma.user.findMany({
    where: {
      role: ROLES.ADMIN,
      id: { notIn: PRIMARY_ADMIN_IDS },
    },
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
