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
    assignedOperator: z.string().trim().max(120).nullable().optional(),
    year: z.number().int().gte(1900).lte(2100),
    currentMileage: z.number().int().nonnegative(),
    owner: z.string().trim().max(120).optional(),
    observations: z.string().trim().max(1000).optional(),
    soatExpiry: z.string().datetime({ offset: true }).optional(),
    tecnomecanicaExpiry: z.string().datetime({ offset: true }).optional(),
    vehicleTaxExpiry: z.string().datetime({ offset: true }).optional(),
    pendingProcedures: z.string().trim().max(2000).optional(),
    fines: z.string().trim().max(2000).optional(),
    currentStatus: z
      .enum(["REGISTERED", "AVAILABLE", "IN_MAINTENANCE", "OUT_OF_SERVICE", "SOLD"])
      .optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

const updateVehicleDetailsSchema = z.object({
  body: z.object({
    brand: z.string().min(2).optional(),
    model: z.string().min(1).optional(),
    year: z.number().int().gte(1900).lte(2100).optional(),
    vin: z.string().trim().min(8).max(30).nullable().optional(),
    assignedOperator: z.string().trim().max(120).nullable().optional(),
    currentMileage: z.number().int().nonnegative().nullable().optional(),
    owner: z.string().trim().max(120).nullable().optional(),
    observations: z.string().trim().max(1000).nullable().optional(),
    soatExpiry: z.string().datetime({ offset: true }).nullable().optional(),
    tecnomecanicaExpiry: z.string().datetime({ offset: true }).nullable().optional(),
    vehicleTaxExpiry: z.string().datetime({ offset: true }).nullable().optional(),
    pendingProcedures: z.string().trim().max(2000).nullable().optional(),
    fines: z.string().trim().max(2000).nullable().optional(),
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
