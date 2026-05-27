const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { normalizeIdentifier } = require("../../utils/identity");
const { isPrimaryAdmin } = require("../../utils/adminAccess");
const { sendVerificationCode } = require("../../utils/mailer");

const EMAIL_CODE_TTL_MS = 30 * 60 * 1000;
const EMAIL_CODE_COOLDOWN_MS = 60 * 1000;

const currentUserSelect = {
  id: true,
  name: true,
  email: true,
  contactEmail: true,
  contactEmailVerified: true,
  role: true,
  isActive: true,
  createdAt: true,
  emailVerification: {
    select: {
      email: true,
      expiresAt: true,
      lastSentAt: true,
    },
  },
};

const normalizeContactEmail = (value) => {
  const email = String(value || "").trim().toLowerCase();
  return email || null;
};

const createVerificationCode = () => String(crypto.randomInt(0, 10000)).padStart(4, "0");

const serializeCurrentUser = (user) => {
  const { emailVerification, ...safeUser } = user;
  return {
    ...safeUser,
    pendingContactEmail: emailVerification?.email || null,
    emailVerificationExpiresAt: emailVerification?.expiresAt || null,
    emailVerificationLastSentAt: emailVerification?.lastSentAt || null,
  };
};

const ensureContactEmailIsAvailable = async (contactEmail, userId) => {
  const emailOwner = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      contactEmail,
    },
    select: { id: true },
  });

  if (emailOwner) {
    throw new ApiError(409, "Este correo ya esta registrado en otro perfil");
  }

  const pendingOwner = await prisma.emailVerification.findFirst({
    where: {
      userId: { not: userId },
      email: contactEmail,
    },
    select: { id: true },
  });

  if (pendingOwner) {
    throw new ApiError(409, "Este correo ya esta pendiente de verificacion en otro perfil");
  }
};

const createUser = asyncHandler(async (req, res) => {
  const { name, identifier, password, role } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedIdentifier = normalizeIdentifier(identifier);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedIdentifier,
      passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      contactEmail: true,
      contactEmailVerified: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return res.status(201).json(user);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: currentUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  return res.json(serializeCurrentUser(user));
});

const requestCurrentUserEmailVerification = asyncHandler(async (req, res) => {
  const contactEmail = normalizeContactEmail(req.body.contactEmail);

  await ensureContactEmailIsAvailable(contactEmail, req.user.id);

  const existingUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: currentUserSelect,
  });

  if (!existingUser) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (
    existingUser.emailVerification?.lastSentAt &&
    Date.now() - existingUser.emailVerification.lastSentAt.getTime() < EMAIL_CODE_COOLDOWN_MS
  ) {
    const retryAfterSeconds = Math.ceil(
      (EMAIL_CODE_COOLDOWN_MS - (Date.now() - existingUser.emailVerification.lastSentAt.getTime())) / 1000
    );
    throw new ApiError(429, `Espera ${retryAfterSeconds} segundos antes de solicitar otro codigo`);
  }

  const code = createVerificationCode();
  const codeHash = await bcrypt.hash(code, 10);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EMAIL_CODE_TTL_MS);

  await sendVerificationCode(contactEmail, code);

  await prisma.emailVerification.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      email: contactEmail,
      codeHash,
      expiresAt,
      lastSentAt: now,
    },
    update: {
      email: contactEmail,
      codeHash,
      expiresAt,
      lastSentAt: now,
    },
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: currentUserSelect,
  });

  return res.json({
    message: "Codigo de verificacion enviado",
    user: serializeCurrentUser(updatedUser),
  });
});

const confirmCurrentUserEmailVerification = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      ...currentUserSelect,
      emailVerification: {
        select: {
          email: true,
          codeHash: true,
          expiresAt: true,
          lastSentAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (!user.emailVerification) {
    throw new ApiError(400, "No hay un correo pendiente de verificacion");
  }

  if (user.emailVerification.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "El codigo expiro. Solicita uno nuevo");
  }

  const isValidCode = await bcrypt.compare(req.body.code, user.emailVerification.codeHash);
  if (!isValidCode) {
    throw new ApiError(400, "Codigo de verificacion incorrecto");
  }

  await ensureContactEmailIsAvailable(user.emailVerification.email, req.user.id);

  const updatedUser = await prisma.$transaction(async (transaction) => {
    await transaction.emailVerification.delete({
      where: { userId: req.user.id },
    });

    return transaction.user.update({
      where: { id: req.user.id },
      data: {
        contactEmail: user.emailVerification.email,
        contactEmailVerified: true,
      },
      select: currentUserSelect,
    });
  });

  return res.json({
    message: "Correo verificado correctamente",
    user: serializeCurrentUser(updatedUser),
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      contactEmail: true,
      contactEmailVerified: true,
      role: true,
      _count: {
        select: {
          vehicles: true,
          statusUpdates: true,
          photos: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (user.role !== "OPERADOR") {
    throw new ApiError(400, "Solo se pueden eliminar operadores");
  }

  if (req.user.id === user.id) {
    throw new ApiError(400, "No puedes eliminar tu propio usuario");
  }

  if (user._count.vehicles || user._count.statusUpdates || user._count.photos) {
    throw new ApiError(409, "No se puede eliminar el operador porque tiene informacion relacionada");
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  return res.json({
    message: "Usuario eliminado correctamente",
    id: user.id,
    name: user.name,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      contactEmail: true,
      contactEmailVerified: true,
      role: true,
      isActive: true,
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (req.user.id === existingUser.id && req.body.isActive === false) {
    throw new ApiError(400, "No puedes desactivar tu propio usuario");
  }

  const data = {};

  if (typeof req.body.name === "string") {
    data.name = req.body.name.trim();
  }

  if (typeof req.body.identifier === "string") {
    data.email = normalizeIdentifier(req.body.identifier);
  }

  if (typeof req.body.password === "string" && req.body.password.trim()) {
    data.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  if (typeof req.body.isActive === "boolean") {
    data.isActive = req.body.isActive;
  }

  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      contactEmail: true,
      contactEmailVerified: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return res.json(updatedUser);
});

module.exports = {
  createUser,
  getCurrentUser,
  requestCurrentUserEmailVerification,
  confirmCurrentUserEmailVerification,
  deleteUser,
  updateUser,
};
