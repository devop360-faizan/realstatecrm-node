const { Router } = require("express");
const AdminController = require("../controllers/admin.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const router = Router();

// All admin routes require Authentication & SUPER_ADMIN Role
router.use(authenticate, authorize("SUPER_ADMIN"));

// Agencies
router.get("/agencies", AdminController.getAgencies);
router.get("/agencies/export", AdminController.exportAgencies);
router.post("/agencies", AdminController.createAgency);
router.get("/agencies/:id", AdminController.getAgencyById);
router.patch("/agencies/:id/change-plan", AdminController.changeAgencyPlan);
router.patch("/agencies/:id/status", AdminController.updateAgencyStatus);

// Users across platform
router.get("/users", AdminController.getUsers);
router.get("/users/export", AdminController.exportUsers);
router.get("/users/:id", AdminController.getUserById);
router.patch("/users/:id/status", AdminController.updateUserStatus);

// Subscription Plans
router.get("/subscription-plans", AdminController.getPlans);
router.get("/subscription-plans/:id", AdminController.getPlanById);
router.post("/subscription-plans", AdminController.createPlan);
router.put("/subscription-plans/:id", AdminController.updatePlan);

// System Settings
router.get("/system-settings", AdminController.getSystemSettings);
router.put("/system-settings", AdminController.updateSystemSettings);
router.post("/system-settings/toggle-maintenance", AdminController.toggleMaintenanceMode);

module.exports = router;
