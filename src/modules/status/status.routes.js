const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { VEHICLE_WRITE_ROLES } = require("../../utils/permissions");
const { updateStatusSchema } = require("./status.validation");
const { updateVehicleStatus } = require("./status.controller");

const router = Router();

router.use(authMiddleware);
router.patch("/:id/status", requireRole(...VEHICLE_WRITE_ROLES), validate(updateStatusSchema), updateVehicleStatus);

module.exports = router;
