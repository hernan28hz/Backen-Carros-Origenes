const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const { getVehiclesGlobalStatus, listOperators, listAdministrators } = require("./admin.controller");

const router = Router();

router.get("/vehicles/status", authMiddleware, requireRole("ADMIN"), getVehiclesGlobalStatus);
router.get("/operators", authMiddleware, requireRole("ADMIN"), listOperators);
router.get("/administrators", authMiddleware, requireRole("ADMIN"), listAdministrators);

module.exports = router;
