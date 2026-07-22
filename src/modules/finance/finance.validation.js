const { z } = require("zod");
const { FINANCE_RECORD_TYPES } = require("../../utils/permissions");

const financeRecordTypeSchema = z.enum(FINANCE_RECORD_TYPES);

const optionalDecimalInput = z.union([z.number(), z.string().trim().min(1)]).optional();

const createFinanceRecordSchema = z.object({
  body: z.object({
    type: financeRecordTypeSchema,
    concept: z.string().trim().min(2).max(160),
    amount: z.union([z.number(), z.string().trim().min(1)]),
    date: z.string().datetime({ offset: true }),
    client: z.string().trim().max(160).optional(),
    vehicleId: z.string().cuid().optional(),
    observations: z.string().trim().max(2000).optional(),
    costPerKm: optionalDecimalInput,
    averageFreight: optionalDecimalInput,
    associatedCosts: z.string().trim().max(2000).optional(),
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
