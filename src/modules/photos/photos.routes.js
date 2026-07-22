const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { VEHICLE_WRITE_ROLES } = require("../../utils/permissions");
const upload = require("./photos.upload");
const { uploadPhotoSchema, deletePhotoSchema } = require("./photos.validation");
const { uploadVehiclePhoto, deleteVehiclePhoto } = require("./photos.controller");

const router = Router();

router.use(authMiddleware);
router.post(
  "/:id/photos",
  requireRole(...VEHICLE_WRITE_ROLES),
  upload.single("photo"),
  validate(uploadPhotoSchema),
  uploadVehiclePhoto
);
router.delete("/:id/photos/:photoId", requireRole(...VEHICLE_WRITE_ROLES), validate(deletePhotoSchema), deleteVehiclePhoto);

module.exports = router;
