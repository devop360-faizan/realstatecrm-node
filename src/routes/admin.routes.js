const { Router } = require("express");
const AdminController = require("../controllers/admin.controller");
const AdminVocabularyController = require("../controllers/adminVocabulary.controller");
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


// ─── VOCABULARY ROUTES ───────────────────────────────────────────────────────
// Property Types
router.route("/vocab/property-types")
  .get(AdminVocabularyController.getPropertyTypes)
  .post(AdminVocabularyController.createPropertyType);
router.route("/vocab/property-types/:id")
  .put(AdminVocabularyController.updatePropertyType)
  .delete(AdminVocabularyController.deletePropertyType);

// Categories
router.route("/vocab/categories")
  .get(AdminVocabularyController.getCategories)
  .post(AdminVocabularyController.createCategory);
router.route("/vocab/categories/:id")
  .put(AdminVocabularyController.updateCategory)
  .delete(AdminVocabularyController.deleteCategory);

// Listing Statuses
router.route("/vocab/listing-statuses")
  .get(AdminVocabularyController.getListingStatuses)
  .post(AdminVocabularyController.createListingStatus);
router.route("/vocab/listing-statuses/:id")
  .put(AdminVocabularyController.updateListingStatus)
  .delete(AdminVocabularyController.deleteListingStatus);

// Amenities
router.route("/vocab/amenities")
  .get(AdminVocabularyController.getAmenities)
  .post(AdminVocabularyController.createAmenity);
router.route("/vocab/amenities/:id")
  .put(AdminVocabularyController.updateAmenity)
  .delete(AdminVocabularyController.deleteAmenity);

// Lead Sources
router.route("/vocab/lead-sources")
  .get(AdminVocabularyController.getLeadSources)
  .post(AdminVocabularyController.createLeadSource);
router.route("/vocab/lead-sources/:id")
  .put(AdminVocabularyController.updateLeadSource)
  .delete(AdminVocabularyController.deleteLeadSource);

module.exports = router;
