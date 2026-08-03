const { z } = require("zod");
const { FINANCE_RECORD_TYPES } = require("../../utils/permissions");
const { normalizeMoney, normalizeType, pickValue } = require("./finance.normalize");

function firstValue(value) {
  return pickValue(value);
}

function emptyToUndefined(value) {
  const normalized = firstValue(value);
  if (normalized === undefined || normalized === null) return undefined;
  if (typeof normalized !== "string") return normalized;
  const trimmed = normalized.trim();
  return trimmed ? trimmed : undefined;
}

const financeRecordTypeSchema = z.preprocess((value) => {
  return normalizeType(value);
}, z.enum(FINANCE_RECORD_TYPES));

const decimalInput = z.preprocess((value) => {
  return normalizeMoney(value);
}, z.union([z.number(), z.string().trim().min(1)]));

const optionalDecimalInput = z.preprocess((value) => {
  return normalizeMoney(value);
}, z.union([z.number(), z.string().trim().min(1)]).optional());
const optionalIntegerInput = z.preprocess(emptyToUndefined, z.union([z.number().int(), z.string().trim().min(1)]).optional());
const optionalText = (max) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalDateInput = z.preprocess(emptyToUndefined, z.string().datetime({ offset: true }).optional());

const createFinanceRecordSchema = z.object({
  body: z.object({
    type: financeRecordTypeSchema,
    concept: z.preprocess(firstValue, z.string().trim().min(2).max(160)),
    amount: decimalInput,
    date: z.preprocess(firstValue, z.string().datetime({ offset: true })),
    client: optionalText(160),
    vehicleId: z.preprocess(emptyToUndefined, z.string().cuid().optional()),
    observations: optionalText(2000),
    costPerKm: optionalDecimalInput,
    averageFreight: optionalDecimalInput,
    associatedCosts: optionalText(2000),
    originDestination: optionalText(191),
    operatorName: optionalText(191),
    operatorExpenses: optionalDecimalInput,
    startDate: optionalDateInput,
    endDate: optionalDateInput,
    mileageConsumed: optionalIntegerInput,
    vendor: optionalText(191),
    buyer: optionalText(191),
    paymentMethod: optionalText(191),
    documentNumber: optionalText(191),
    maintenanceType: optionalText(191),
    odometerKm: optionalIntegerInput,
    confirmVehicleSold: z.preprocess(firstValue, z.union([z.boolean(), z.literal("true"), z.literal("false")]).optional()),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

const updateFinanceRecordSchema = z.object({
  body: createFinanceRecordSchema.shape.body.partial().refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}).optional().default({}),
});

const financeRecordIdSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}).optional().default({}),
});

module.exports = {
  createFinanceRecordSchema,
  updateFinanceRecordSchema,
  financeRecordIdSchema,
};
