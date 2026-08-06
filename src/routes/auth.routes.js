const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const { loginValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');
const authenticate = require('../middlewares/auth.middleware');

const router = Router();

// Public route
router.post('/login', loginValidator, validate, AuthController.login);

// Protected route
router.get('/me', authenticate, AuthController.me);

module.exports = router;
