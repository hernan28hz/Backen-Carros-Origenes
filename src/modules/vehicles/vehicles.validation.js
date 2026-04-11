const { z } = require("zod");

const paramsIdSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}).optional().default({}),
});

const createVehicleSchema = z.object({
  body: z.object({
    plate: z.string().min(4).max(10),
    vin: z.string().min(8).max(30).optional(),
    brand: z.string().min(2),
    model: z.string().min(1),
    assignedOperator: z.string().trim().max(120).optional(),
    year: z.number().int().gte(1900).lte(2100),
    currentStatus: z
      .enum(["REGISTERED", "AVAILABLE", "IN_MAINTENANCE", "OUT_OF_SERVICE", "SOLD"])
      .optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

const updateVehicleDetailsSchema = z.object({
  body: z.object({
    assignedOperator: z.string().trim().max(120).optional(),
    observations: z.string().trim().max(1000).optional(),
    soatExpiry: z.string().datetime({ offset: true }).optional(),
    tecnomecanicaExpiry: z.string().datetime({ offset: true }).optional(),
    vehicleTaxExpiry: z.string().datetime({ offset: true }).optional(),
    pendingProcedures: z.string().trim().max(2000).optional(),
    fines: z.string().trim().max(2000).optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}).optional().default({}),
});

module.exports = {
  createVehicleSchema,
  paramsIdSchema,
  updateVehicleDetailsSchema,
};
