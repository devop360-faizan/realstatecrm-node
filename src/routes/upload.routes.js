const { Router } = require("express");
const UploadController = require("../controllers/upload.controller");
const upload = require("../middlewares/upload.middleware");
const authenticate = require("../middlewares/auth.middleware");

const router = Router();

// Protect upload endpoints
router.use(authenticate);

// Single file upload
router.post("/single", upload.single("file"), UploadController.uploadSingle);

// Multiple files upload (max 10 files)
router.post("/multiple", upload.array("files", 10), UploadController.uploadMultiple);

module.exports = router;
