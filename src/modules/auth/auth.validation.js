const { z } = require("zod");
const { isValidIdentifier } = require("../../utils/identity");

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(5).refine(isValidIdentifier, {
      message: "Debe ser un email valido o una cedula valida",
    }),
    password: z.string().min(6),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

module.exports = {
  loginSchema,
};
