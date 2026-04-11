const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createVehicleSchema, paramsIdSchema, updateVehicleDetailsSchema } = require("./vehicles.validation");
const { createVehicle, listVehicles, getVehicleById, updateVehicleDetails, deleteVehicle } = require("./vehicles.controller");

const router = Router();

router.use(authMiddleware);
router.post("/", requireRole("ADMIN", "OPERADOR"), validate(createVehicleSchema), createVehicle);
router.get("/", requireRole("ADMIN", "OPERADOR"), listVehicles);
router.get("/:id", requireRole("ADMIN", "OPERADOR"), validate(paramsIdSchema), getVehicleById);
router.patch("/:id/details", requireRole("ADMIN", "OPERADOR"), validate(updateVehicleDetailsSchema), updateVehicleDetails);
router.delete("/:id", requireRole("ADMIN", "OPERADOR"), validate(paramsIdSchema), deleteVehicle);

module.exports = router;
