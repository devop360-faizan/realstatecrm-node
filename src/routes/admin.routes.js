const { Router } = require('express');
const AdminController = require('../controllers/admin.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

const router = Router();

// All admin routes require Authentication & SUPER_ADMIN Role
router.use(authenticate, authorize('SUPER_ADMIN'));

// Agencies
router.get('/agencies', AdminController.getAgencies);
router.post('/agencies', AdminController.createAgency);
router.patch('/agencies/:id/status', AdminController.updateAgencyStatus);

// Users across platform
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);

// Subscription Plans
router.get('/subscription-plans', AdminController.getPlans);

module.exports = router;
