const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");

const ADMIN_DETAIL_FIELDS = {
  assignedOperator: "Operador asignado",
  observations: "Observaciones",
  soatExpiry: "Vencimiento de SOAT",
  tecnomecanicaExpiry: "Vencimiento tecnomecanica",
  vehicleTaxExpiry: "Vencimiento impuesto vehicular",
  pendingProcedures: "Tramites pendientes",
  fines: "Multas",
};

const OPERATOR_ALLOWED_DETAIL_FIELDS = ["soatExpiry", "tecnomecanicaExpiry", "vehicleTaxExpiry", "fines"];

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeDetailValue(field, value) {
  if (field.endsWith("Expiry")) {
    return normalizeNullableDate(value);
  }

  return normalizeNullableText(value);
}

function normalizeNullableText(value) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeNullableDate(value) {
  return value ? new Date(value) : null;
}

function serializeHistoryValue(field, value) {
  if (!value) {
    return null;
  }

  if (field.endsWith("Expiry")) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

const createVehicle = asyncHandler(async (req, res) => {
  const { plate, vin, brand, model, assignedOperator, year, currentStatus } = req.body;
  const normalizedPlate = plate.toUpperCase().trim();

  const vehicle = await prisma.vehicle.create({
    data: {
      plate: normalizedPlate,
      vin: vin?.toUpperCase().trim(),
      brand,
      model,
      assignedOperator: assignedOperator?.trim() || null,
      year,
      currentStatus: currentStatus || "AVAILABLE",
      createdById: req.user.id,
      statusHistory: {
        create: {
          statusType: "REGISTERED",
          description: "Vehicle registered",
          updatedById: req.user.id,
        },
      },
    },
    include: {
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return res.status(201).json(vehicle);
});

const listVehicles = asyncHandler(async (req, res) => {
  const where = req.user.role === "ADMIN" ? {} : { createdById: req.user.id };

  const vehicles = await prisma.vehicle.findMany({
    where,
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
  });

  return res.json(vehicles);
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      adminHistory: {
        orderBy: { createdAt: "desc" },
        include: {
          updatedBy: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      photos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (req.user.role !== "ADMIN" && vehicle.createdById !== req.user.id) {
    throw new ApiError(403, "You do not have access to this vehicle");
  }

  return res.json(vehicle);
});

const updateVehicleDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedOperator, observations, soatExpiry, tecnomecanicaExpiry, vehicleTaxExpiry, pendingProcedures, fines } =
    req.body;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: {
      id: true,
      createdById: true,
      assignedOperator: true,
      observations: true,
      soatExpiry: true,
      tecnomecanicaExpiry: true,
      vehicleTaxExpiry: true,
      pendingProcedures: true,
      fines: true,
    },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const isAdmin = req.user.role === "ADMIN";
  if (!isAdmin && vehicle.createdById !== req.user.id) {
    throw new ApiError(403, "You do not have access to update vehicle details");
  }

  const payload = {
    assignedOperator,
    observations,
    soatExpiry,
    tecnomecanicaExpiry,
    vehicleTaxExpiry,
    pendingProcedures,
    fines,
  };
  const allowedFields = isAdmin ? Object.keys(ADMIN_DETAIL_FIELDS) : OPERATOR_ALLOWED_DETAIL_FIELDS;
  const nextDetails = allowedFields.reduce((accumulator, field) => {
    if (!hasOwnProperty(payload, field)) {
      return accumulator;
    }

    accumulator[field] = normalizeDetailValue(field, payload[field]);
    return accumulator;
  }, {});

  if (!Object.keys(nextDetails).length) {
    throw new ApiError(400, "No vehicle detail fields available to update");
  }

  const changedFields = Object.keys(nextDetails)
    .map((field) => {
      const previousValue = serializeHistoryValue(field, vehicle[field]);
      const nextValue = serializeHistoryValue(field, nextDetails[field]);
      if (previousValue === nextValue) {
        return null;
      }

      return {
        vehicleId: id,
        field: ADMIN_DETAIL_FIELDS[field],
        oldValue: previousValue,
        newValue: nextValue,
        updatedById: req.user.id,
      };
    })
    .filter(Boolean);

  const updatedVehicle = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id },
      data: nextDetails,
    });

    if (changedFields.length) {
      await tx.vehicleAdminHistory.createMany({
        data: changedFields,
      });
    }

    return tx.vehicle.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        adminHistory: {
          orderBy: { createdAt: "desc" },
          include: {
            updatedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        photos: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });

  return res.json(updatedVehicle);
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    select: { id: true, plate: true, createdById: true },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (req.user.role !== "ADMIN" && vehicle.createdById !== req.user.id) {
    throw new ApiError(403, "You do not have access to this vehicle");
  }

  await prisma.vehicle.delete({
    where: { id: req.params.id },
  });

  return res.json({ message: "Vehicle deleted successfully", id: vehicle.id, plate: vehicle.plate });
});

module.exports = {
  createVehicle,
  listVehicles,
  getVehicleById,
  updateVehicleDetails,
  deleteVehicle,
};
