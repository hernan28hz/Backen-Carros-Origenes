const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { createAuditLog } = require("../../services/auditLog");

function normalizeNullableText(value) {
  if (typeof value !== "string") return value ?? null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeDecimal(value) {
  if (value === undefined || value === null || value === "") return undefined;
  return value;
}

function buildFinanceData(body) {
  const data = {};
  const assign = (field, value) => {
    if (value !== undefined) {
      data[field] = value;
    }
  };

  assign("type", body.type);
  assign("concept", typeof body.concept === "string" ? body.concept.trim() : body.concept);
  assign("amount", normalizeDecimal(body.amount));
  assign("date", body.date ? new Date(body.date) : undefined);
  assign("client", normalizeNullableText(body.client));
  assign("vehicleId", normalizeNullableText(body.vehicleId));
  assign("observations", normalizeNullableText(body.observations));
  assign("costPerKm", normalizeDecimal(body.costPerKm));
  assign("averageFreight", normalizeDecimal(body.averageFreight));
  assign("associatedCosts", normalizeNullableText(body.associatedCosts));

  return data;
}

function serializeDecimal(value) {
  return value === null || value === undefined ? null : Number(value);
}

function serializeFinanceRecord(record) {
  return {
    ...record,
    amount: serializeDecimal(record.amount),
    costPerKm: serializeDecimal(record.costPerKm),
    averageFreight: serializeDecimal(record.averageFreight),
  };
}

const financeInclude = {
  vehicle: {
    select: {
      id: true,
      plate: true,
      brand: true,
      model: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
};

const listFinanceRecords = asyncHandler(async (_req, res) => {
  const records = await prisma.financeRecord.findMany({
    orderBy: { date: "desc" },
    include: financeInclude,
  });

  return res.json(records.map(serializeFinanceRecord));
});

const getFinanceSummary = asyncHandler(async (_req, res) => {
  const records = await prisma.financeRecord.groupBy({
    by: ["type"],
    _sum: {
      amount: true,
    },
  });

  const summary = records.reduce(
    (accumulator, record) => {
      const amount = Number(record._sum.amount || 0);
      accumulator.byType[record.type] = (accumulator.byType[record.type] || 0) + amount;
      if (["INGRESO", "FLETE", "VENTA_VEHICULO"].includes(record.type)) {
        accumulator.income += amount;
      } else {
        accumulator.expenses += amount;
      }
      accumulator.balance = accumulator.income - accumulator.expenses;
      return accumulator;
    },
    { income: 0, expenses: 0, balance: 0, byType: {} }
  );

  return res.json(summary);
});

const createFinanceRecord = asyncHandler(async (req, res) => {
  const data = buildFinanceData(req.body);

  if (data.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true },
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehiculo no encontrado");
    }
  }

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.financeRecord.create({
      data: {
        ...data,
        createdById: req.user.id,
      },
      include: financeInclude,
    });

    await createAuditLog(
      {
        userId: req.user.id,
        action: "CREATE",
        entity: "FinanceRecord",
        entityId: created.id,
        newValue: serializeFinanceRecord(created),
      },
      tx
    );

    return created;
  });

  return res.status(201).json(serializeFinanceRecord(record));
});

const updateFinanceRecord = asyncHandler(async (req, res) => {
  const existingRecord = await prisma.financeRecord.findUnique({
    where: { id: req.params.id },
    include: financeInclude,
  });

  if (!existingRecord) {
    throw new ApiError(404, "Registro financiero no encontrado");
  }

  const data = buildFinanceData(req.body);

  if (data.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      select: { id: true },
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehiculo no encontrado");
    }
  }

  const updatedRecord = await prisma.$transaction(async (tx) => {
    const updated = await tx.financeRecord.update({
      where: { id: existingRecord.id },
      data,
      include: financeInclude,
    });

    await createAuditLog(
      {
        userId: req.user.id,
        action: "UPDATE",
        entity: "FinanceRecord",
        entityId: updated.id,
        oldValue: serializeFinanceRecord(existingRecord),
        newValue: serializeFinanceRecord(updated),
      },
      tx
    );

    return updated;
  });

  return res.json(serializeFinanceRecord(updatedRecord));
});

const deleteFinanceRecord = asyncHandler(async (req, res) => {
  const existingRecord = await prisma.financeRecord.findUnique({
    where: { id: req.params.id },
    include: financeInclude,
  });

  if (!existingRecord) {
    throw new ApiError(404, "Registro financiero no encontrado");
  }

  await prisma.$transaction(async (tx) => {
    await tx.financeRecord.delete({
      where: { id: existingRecord.id },
    });

    await createAuditLog(
      {
        userId: req.user.id,
        action: "DELETE",
        entity: "FinanceRecord",
        entityId: existingRecord.id,
        oldValue: serializeFinanceRecord(existingRecord),
      },
      tx
    );
  });

  return res.json({ message: "Registro financiero eliminado correctamente", id: existingRecord.id });
});

module.exports = {
  listFinanceRecords,
  getFinanceSummary,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
};
