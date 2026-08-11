const { Router } = require("express");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const uploadRoutes = require("./upload.routes");
const propertyRoutes = require("./property.routes");
const lookupRoutes = require("./lookup.routes");

const router = Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/upload", uploadRoutes);
router.use("/v1/properties", propertyRoutes);
router.use("/v1/lookup", lookupRoutes);

module.exports = router;
