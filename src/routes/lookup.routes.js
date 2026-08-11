const { Router } = require("express");
const LookupController = require("../controllers/lookup.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = Router();

// All lookup routes require a valid login (any role)
router.use(authenticate);

// All dropdown data for property create/edit form (single call)
router.get("/property-form", LookupController.getPropertyFormData);

// Lead sources for client/lead form
router.get("/lead-sources", LookupController.getLeadSources);

module.exports = router;
