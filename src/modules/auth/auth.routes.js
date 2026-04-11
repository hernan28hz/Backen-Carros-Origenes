const { Router } = require("express");
const validate = require("../../middlewares/validate.middleware");
const { loginSchema } = require("./auth.validation");
const { login } = require("./auth.controller");

const router = Router();

router.post("/login", validate(loginSchema), login);

module.exports = router;
