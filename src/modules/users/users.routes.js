const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const {
  createUserSchema,
  userIdSchema,
  updateUserSchema,
  requestCurrentUserEmailVerificationSchema,
  confirmCurrentUserEmailVerificationSchema,
} = require("./users.validation");
const {
  createUser,
  getCurrentUser,
  requestCurrentUserEmailVerification,
  confirmCurrentUserEmailVerification,
  deleteUser,
  updateUser,
} = require("./users.controller");

const router = Router();

router.post("/", authMiddleware, requireRole("ADMIN"), validate(createUserSchema), createUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post(
  "/me/email-verification/request",
  authMiddleware,
  validate(requestCurrentUserEmailVerificationSchema),
  requestCurrentUserEmailVerification
);
router.post(
  "/me/email-verification/confirm",
  authMiddleware,
  validate(confirmCurrentUserEmailVerificationSchema),
  confirmCurrentUserEmailVerification
);
router.patch("/:id", authMiddleware, requireRole("ADMIN"), validate(updateUserSchema), updateUser);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), validate(userIdSchema), deleteUser);

module.exports = router;
