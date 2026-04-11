const { z } = require("zod");
const { isValidIdentifier } = require("../../utils/identity");

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    identifier: z.string().min(5).refine(isValidIdentifier, {
      message: "Debe ser un email valido o una cedula valida",
    }),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "OPERADOR"]).default("OPERADOR"),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

const userIdSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional().default({}),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    identifier: z.string().min(5).refine(isValidIdentifier, {
      message: "Debe ser un email valido o una cedula valida",
    }).optional(),
    password: z.string().min(6).optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional().default({}),
});

module.exports = {
  createUserSchema,
  userIdSchema,
  updateUserSchema,
};
