const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createUserSchema, userIdSchema, updateUserSchema } = require("./users.validation");
const { createUser, deleteUser, updateUser } = require("./users.controller");

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validate(createUserSchema), createUser);
router.patch("/:id", authMiddleware, requireRole("ADMIN"), validate(updateUserSchema), updateUser);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), validate(userIdSchema), deleteUser);

module.exports = router;
