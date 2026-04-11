const bcrypt = require("bcryptjs");
const prisma = require("../../config/prisma");
const ApiError = require("../../utils/apiError");
const asyncHandler = require("../../utils/asyncHandler");
const { normalizeIdentifier } = require("../../utils/identity");
const { isPrimaryAdmin } = require("../../utils/adminAccess");

const createUser = asyncHandler(async (req, res) => {
  const { name, identifier, password, role } = req.body;
  if (role === "ADMIN" && !isPrimaryAdmin(req.user)) {
    throw new ApiError(403, "Solo el administrador principal puede crear administradores");
  }

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
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return res.status(201).json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
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
      role: true,
      isActive: true,
    },
  });

  if (!existingUser) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (existingUser.role === "ADMIN" && !isPrimaryAdmin(req.user)) {
    throw new ApiError(403, "Solo el administrador principal puede editar administradores");
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
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return res.json(updatedUser);
});

module.exports = {
  createUser,
  deleteUser,
  updateUser,
};
