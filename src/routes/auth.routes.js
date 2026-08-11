const { Router } = require("express");
const AuthController = require("../controllers/auth.controller");
const { loginValidator } = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

// Public route
router.post("/login", loginValidator, validate, AuthController.login);
router.post("/logout", authenticate, AuthController.logout);
// Protected route
router.get("/me", authenticate, AuthController.me);
router.put("/me", authenticate, upload.single("avatar"), AuthController.updateProfile);
router.put("/change-password", authenticate, AuthController.changePassword);

module.exports = router;
