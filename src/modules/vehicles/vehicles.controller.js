const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { createAuditLog } = require("../../services/auditLog");

const ADMIN_DETAIL_FIELDS = {
  brand: "Marca",
  model: "Modelo",
  year: "Anio",
  vin: "VIN",
  assignedOperator: "Operador asignado",
  owner: "Propietario",
  observations: "Observaciones",
  soatExpiry: "Vencimiento de SOAT",
  tecnomecanicaExpiry: "Vencimiento tecnomecanica",
  vehicleTaxExpiry: "Vencimiento impuesto vehicular",
  pendingProcedures: "Tramites pendientes",
  fines: "Multas",
  currentMileage: "Kilometraje actual",
};

const VEHICLE_DETAIL_HISTORY_LIMIT = Number(process.env.VEHICLE_DETAIL_HISTORY_LIMIT || 25);
const VEHICLE_DETAIL_PHOTO_LIMIT = Number(process.env.VEHICLE_DETAIL_PHOTO_LIMIT || 12);

const vehicleListSelect = {
  id: true,
  plate: true,
  brand: true,
  model: true,
  year: true,
  currentStatus: true,
  currentMileage: true,
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

const vehicleDetailInclude = {
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  statusHistory: {
    orderBy: { createdAt: "desc" },
    take: VEHICLE_DETAIL_HISTORY_LIMIT,
  },
  adminHistory: {
    orderBy: { createdAt: "desc" },
    take: VEHICLE_DETAIL_HISTORY_LIMIT,
    include: {
      updatedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  },
  photos: {
    orderBy: { createdAt: "desc" },
    take: VEHICLE_DETAIL_PHOTO_LIMIT,
  },
};

function hasOwnProperty(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeDetailValue(field, value) {
  if (field.endsWith("Expiry")) {
    return normalizeNullableDate(value);
  }

  if (field === "currentMileage") {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    return Number(value);
  }

  if (field === "year") {
    return Number(value);
  }

  if (field === "vin") {
    const normalized = value?.trim();
    return normalized ? normalized.toUpperCase() : null;
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
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (field.endsWith("Expiry")) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

const createVehicle = asyncHandler(async (req, res) => {
  const {
    plate,
    vin,
    brand,
    model,
    assignedOperator,
    year,
    currentMileage,
    currentStatus,
    owner,
    observations,
    soatExpiry,
    tecnomecanicaExpiry,
    vehicleTaxExpiry,
    pendingProcedures,
    fines,
  } = req.body;
  const normalizedPlate = plate.toUpperCase().trim();

  const vehicle = await prisma.$transaction(async (tx) => {
    const createdVehicle = await tx.vehicle.create({
      data: {
        plate: normalizedPlate,
        vin: vin?.toUpperCase().trim(),
        brand,
        model,
        assignedOperator: assignedOperator?.trim() || null,
        year,
        currentMileage,
        owner: owner?.trim() || null,
        observations: observations?.trim() || null,
        soatExpiry: normalizeNullableDate(soatExpiry),
        tecnomecanicaExpiry: normalizeNullableDate(tecnomecanicaExpiry),
        vehicleTaxExpiry: normalizeNullableDate(vehicleTaxExpiry),
        pendingProcedures: pendingProcedures?.trim() || null,
        fines: fines?.trim() || null,
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

    await createAuditLog(
      {
        userId: req.user.id,
        action: "CREATE",
        entity: "Vehicle",
        entityId: createdVehicle.id,
        newValue: createdVehicle,
      },
      tx
    );

    return createdVehicle;
  });

  return res.status(201).json(vehicle);
});

const listVehicles = asyncHandler(async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    select: vehicleListSelect,
  });

  return res.json(vehicles);
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    include: vehicleDetailInclude,
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  return res.json(vehicle);
});

const updateVehicleDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    brand,
    model,
    year,
    assignedOperator,
    currentMileage,
    owner,
    observations,
    soatExpiry,
    tecnomecanicaExpiry,
    vehicleTaxExpiry,
    pendingProcedures,
    fines,
    vin,
  } = req.body;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      vin: true,
      assignedOperator: true,
      currentMileage: true,
      owner: true,
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

  const payload = {
    brand,
    model,
    year,
    vin,
    assignedOperator,
    currentMileage,
    owner,
    observations,
    soatExpiry,
    tecnomecanicaExpiry,
    vehicleTaxExpiry,
    pendingProcedures,
    fines,
  };
  const allowedFields = Object.keys(ADMIN_DETAIL_FIELDS);
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

      await createAuditLog(
        {
          userId: req.user.id,
          action: "UPDATE",
          entity: "Vehicle",
          entityId: id,
          oldValue: changedFields.reduce((accumulator, item) => {
            accumulator[item.field] = item.oldValue;
            return accumulator;
          }, {}),
          newValue: changedFields.reduce((accumulator, item) => {
            accumulator[item.field] = item.newValue;
            return accumulator;
          }, {}),
          metadata: { changedFields: changedFields.map((item) => item.field) },
        },
        tx
      );
    }

    return tx.vehicle.findUnique({
      where: { id },
      include: vehicleDetailInclude,
    });
  });

  return res.json(updatedVehicle);
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id },
    select: { id: true, plate: true },
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.vehicle.delete({
      where: { id: req.params.id },
    });

    await createAuditLog(
      {
        userId: req.user.id,
        action: "DELETE",
        entity: "Vehicle",
        entityId: vehicle.id,
        oldValue: vehicle,
      },
      tx
    );
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
