const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const AdminAgencyService = require("../services/adminAgency.service");
const AdminUserService = require("../services/adminUser.service");
const AdminPlanService = require("../services/adminPlan.service");
const AdminSettingsService = require("../services/adminSettings.service");

class AdminController {
  // ─── Agencies ─────────────────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/agencies
   */
  getAgencies = asyncHandler(async (req, res) => {
    const { search, plan, status, city, page, limit } = req.query;
    const result = await AdminAgencyService.getAllAgencies({
      search,
      plan,
      status,
      city,
      page,
      limit,
    });
    return ApiResponse.success(res, result, "Agencies retrieved successfully");
  });

  /**
   * @route GET /api/v1/admin/agencies/export
   */
  exportAgencies = asyncHandler(async (req, res) => {
    const { search, plan, status, city } = req.query;
    const csvContent = await AdminAgencyService.exportAgenciesCSV({ search, plan, status, city });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="agencies-export.csv"');
    return res.status(200).send(csvContent);
  });

  /**
   * @route POST /api/v1/admin/agencies
   */
  createAgency = asyncHandler(async (req, res) => {
    const result = await AdminAgencyService.createAgency(req.body);
    return ApiResponse.success(
      res,
      result,
      "Agency workspace & owner created successfully",
      201,
    );
  });

  /**
   * @route GET /api/v1/admin/agencies/:id
   */
  getAgencyById = asyncHandler(async (req, res) => {
    const agency = await AdminAgencyService.getSingleAgencyById(req.params.id);
    return ApiResponse.success(
      res,
      agency,
      "Agency details retrieved successfully",
    );
  });

  /**
   * @route PATCH /api/v1/admin/agencies/:id/change-plan
   */
  changeAgencyPlan = asyncHandler(async (req, res) => {
    const { planId } = req.body;
    const agency = await AdminAgencyService.changePlan(req.params.id, planId);
    return ApiResponse.success(res, agency, "Agency subscription plan updated");
  });

  /**
   * @route PATCH /api/v1/admin/agencies/:id/status
   */
  updateAgencyStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const agency = await AdminAgencyService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, agency, "Agency status updated");
  });

  // ─── Users ────────────────────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/users
   */
  getUsers = asyncHandler(async (req, res) => {
    const { search, role, status, page, limit } = req.query;
    const result = await AdminUserService.getAllUsers({
      search,
      role,
      status,
      page,
      limit,
    });
    return ApiResponse.success(res, result, "Platform users retrieved");
  });

  /**
   * @route GET /api/v1/admin/users/export
   */
  exportUsers = asyncHandler(async (req, res) => {
    const { search, role, status } = req.query;
    const csvContent = await AdminUserService.exportUsersCSV({ search, role, status });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="users-export.csv"');
    return res.status(200).send(csvContent);
  });

  /**
   * @route GET /api/v1/admin/users/:id
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await AdminUserService.getSingleUserById(req.params.id);
    return ApiResponse.success(
      res,
      user,
      "User details retrieved successfully",
    );
  });

  /**
   * @route PATCH /api/v1/admin/users/:id/status
   */
  updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const user = await AdminUserService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, user, "User status updated");
  });

  // ─── Subscription Plans ───────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/subscription-plans
   */
  getPlans = asyncHandler(async (_req, res) => {
    const plans = await AdminPlanService.getAllPlans();
    return ApiResponse.success(res, plans, "Subscription plans retrieved");
  });

  /**
   * @route GET /api/v1/admin/subscription-plans/:id
   */
  getPlanById = asyncHandler(async (req, res) => {
    const plan = await AdminPlanService.getSinglePlanById(req.params.id);
    return ApiResponse.success(res, plan, "Subscription plan details retrieved");
  });

  /**
   * @route POST /api/v1/admin/subscription-plans
   */
  createPlan = asyncHandler(async (req, res) => {
    const plan = await AdminPlanService.createPlan(req.body);
    return ApiResponse.success(res, plan, "Subscription plan created & synced with Stripe", 201);
  });

  /**
   * @route PUT /api/v1/admin/subscription-plans/:id
   */
  updatePlan = asyncHandler(async (req, res) => {
    const plan = await AdminPlanService.updatePlan(req.params.id, req.body);
    return ApiResponse.success(res, plan, "Subscription plan updated & synced with Stripe");
  });

  // ─── System Settings ──────────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/system-settings
   */
  getSystemSettings = asyncHandler(async (_req, res) => {
    const settings = await AdminSettingsService.getSystemSettings();
    return ApiResponse.success(res, settings, "System settings retrieved successfully");
  });

  /**
   * @route PUT /api/v1/admin/system-settings
   */
  updateSystemSettings = asyncHandler(async (req, res) => {
    const settings = await AdminSettingsService.updateSystemSettings(req.body);
    return ApiResponse.success(res, settings, "System settings updated successfully");
  });

  /**
   * @route POST /api/v1/admin/system-settings/toggle-maintenance
   */
  toggleMaintenanceMode = asyncHandler(async (_req, res) => {
    const result = await AdminSettingsService.toggleMaintenanceMode();
    return ApiResponse.success(res, result, result.message);
  });
}

module.exports = new AdminController();
