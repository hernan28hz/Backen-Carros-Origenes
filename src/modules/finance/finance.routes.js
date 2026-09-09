const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const ApiError = require("../../utils/apiError");
const { canManageFinance, canViewFinanceBalance } = require("../../utils/permissions");
const upload = require("./finance.upload");
const { normalizeFinanceBody } = require("./finance.normalize");
const {
  createFinanceRecordSchema,
  updateFinanceRecordSchema,
  financeRecordIdSchema,
} = require("./finance.validation");
const {
  listFinanceRecords,
  getFinanceSummary,
  getFinanceBalance,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
} = require("./finance.controller");

const router = Router();

const requireFinanceAccess = (req, _res, next) => {
  if (!canManageFinance(req.user)) {
    return next(new ApiError(403, "No tienes permisos para gestionar finanzas"));
  }

  return next();
};

const requireFinanceBalanceAccess = (req, _res, next) => {
  if (!canViewFinanceBalance(req.user)) {
    return next(new ApiError(403, "No tienes permisos para ver el balance financiero"));
  }

  return next();
};

// Solo lectura: accesible tambien para el DIRECTOR. Se declara antes del guard
// de gestion para no exigir permisos de escritura.
router.get("/balance", authMiddleware, requireFinanceBalanceAccess, getFinanceBalance);

router.use(authMiddleware, requireFinanceAccess);
router.get("/", listFinanceRecords);
router.get("/summary", getFinanceSummary);
router.post("/", upload.single("invoice"), normalizeFinanceBody, validate(createFinanceRecordSchema), createFinanceRecord);
router.patch("/:id", upload.single("invoice"), normalizeFinanceBody, validate(updateFinanceRecordSchema), updateFinanceRecord);
router.delete("/:id", validate(financeRecordIdSchema), deleteFinanceRecord);

module.exports = router;
