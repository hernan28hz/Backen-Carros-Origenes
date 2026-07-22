const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const ApiError = require("../../utils/apiError");
const { canManageFinance } = require("../../utils/permissions");
const {
  createFinanceRecordSchema,
  updateFinanceRecordSchema,
  financeRecordIdSchema,
} = require("./finance.validation");
const {
  listFinanceRecords,
  getFinanceSummary,
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

router.use(authMiddleware, requireFinanceAccess);
router.get("/", listFinanceRecords);
router.get("/summary", getFinanceSummary);
router.post("/", validate(createFinanceRecordSchema), createFinanceRecord);
router.patch("/:id", validate(updateFinanceRecordSchema), updateFinanceRecord);
router.delete("/:id", validate(financeRecordIdSchema), deleteFinanceRecord);

module.exports = router;
