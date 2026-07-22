const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { VEHICLE_READ_ROLES, VEHICLE_WRITE_ROLES } = require("../../utils/permissions");
const { createVehicleSchema, paramsIdSchema, updateVehicleDetailsSchema } = require("./vehicles.validation");
const { createVehicle, listVehicles, getVehicleById, updateVehicleDetails, deleteVehicle } = require("./vehicles.controller");

const router = Router();

router.use(authMiddleware);
router.post("/", requireRole(...VEHICLE_WRITE_ROLES), validate(createVehicleSchema), createVehicle);
router.get("/", requireRole(...VEHICLE_READ_ROLES), listVehicles);
router.get("/:id", requireRole(...VEHICLE_READ_ROLES), validate(paramsIdSchema), getVehicleById);
router.patch("/:id/details", requireRole(...VEHICLE_WRITE_ROLES), validate(updateVehicleDetailsSchema), updateVehicleDetails);
router.delete("/:id", requireRole(...VEHICLE_WRITE_ROLES), validate(paramsIdSchema), deleteVehicle);

module.exports = router;
