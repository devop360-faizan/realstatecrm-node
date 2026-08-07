const { Router } = require("express");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const uploadRoutes = require("./upload.routes");

const router = Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/upload", uploadRoutes);

module.exports = router;
