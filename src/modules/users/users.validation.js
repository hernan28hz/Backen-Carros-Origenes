const { z } = require("zod");
const { isValidIdentifier } = require("../../utils/identity");
const { ROLES } = require("../../utils/permissions");

const systemRoleSchema = z.enum([ROLES.ADMIN, ROLES.DIRECTOR, ROLES.GERENTE]);

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    identifier: z.string().min(5).refine(isValidIdentifier, {
      message: "Debe ser un email valido o una cedula valida",
    }),
    password: z.string().min(6),
    role: systemRoleSchema.default(ROLES.DIRECTOR),
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
    role: systemRoleSchema.optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}).optional().default({}),
});

const requestCurrentUserEmailVerificationSchema = z.object({
  body: z.object({
    contactEmail: z.string().trim().email({
      message: "Debe ser un correo electronico valido",
    }),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

const confirmCurrentUserEmailVerificationSchema = z.object({
  body: z.object({
    code: z.string().trim().regex(/^[0-9]{4}$/, {
      message: "El codigo debe tener 4 digitos",
    }),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

module.exports = {
  createUserSchema,
  userIdSchema,
  updateUserSchema,
  requestCurrentUserEmailVerificationSchema,
  confirmCurrentUserEmailVerificationSchema,
};
