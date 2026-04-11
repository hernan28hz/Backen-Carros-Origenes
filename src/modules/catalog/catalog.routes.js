const { Router } = require("express");
const { listPublicVehicles } = require("./catalog.controller");

const router = Router();

router.get("/vehicles", listPublicVehicles);

module.exports = router;
