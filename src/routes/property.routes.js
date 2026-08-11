const { Router } = require("express");
const PropertyController = require("../controllers/property.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

router.use(authenticate);

// List and Create
router.get("/", PropertyController.getProperties);
router.post("/", upload.array("images", 10), PropertyController.createProperty);

// Specific Property
router.get("/:id", PropertyController.getPropertyById);
router.put("/:id", upload.none(), PropertyController.updateProperty);
router.delete("/:id", PropertyController.deleteProperty);

// Upload Images (up to 10 images at once)
router.post("/:id/images", upload.array("images", 10), PropertyController.uploadImages);

// Approve Listing (Manager/Owner only)
router.patch("/:id/approve", authorize("AGENCY_OWNER", "OFFICE_MANAGER", "SUPER_ADMIN"), PropertyController.approveListing);

module.exports = router;
