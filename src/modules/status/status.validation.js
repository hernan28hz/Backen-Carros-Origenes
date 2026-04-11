const { z } = require("zod");

const updateStatusSchema = z.object({
  body: z.object({
    statusType: z.enum(["REGISTERED", "AVAILABLE", "IN_MAINTENANCE", "OUT_OF_SERVICE", "SOLD"]),
    description: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
  query: z.object({}).optional().default({}),
});

module.exports = {
  updateStatusSchema,
};
