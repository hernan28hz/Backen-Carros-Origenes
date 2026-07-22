const { Router } = require("express");
const { serveVehicleImageVariant } = require("./images.controller");

const router = Router();

router.get("/vehicles/:fileName", serveVehicleImageVariant);

module.exports = router;
