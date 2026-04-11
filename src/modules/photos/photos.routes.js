const { Router } = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const requireRole = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const upload = require("./photos.upload");
const { uploadPhotoSchema } = require("./photos.validation");
const { uploadVehiclePhoto, deleteVehiclePhoto } = require("./photos.controller");

const router = Router();

router.use(authMiddleware);
router.post(
  "/:id/photos",
  requireRole("ADMIN", "OPERADOR"),
  upload.single("photo"),
  validate(uploadPhotoSchema),
  uploadVehiclePhoto
);
router.delete("/:id/photos/:photoId", requireRole("ADMIN", "OPERADOR"), deleteVehiclePhoto);

module.exports = router;
