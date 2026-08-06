const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AdminAgencyService = require('../services/adminAgency.service');
const AdminUserService = require('../services/adminUser.service');
const AdminPlanService = require('../services/adminPlan.service');

class AdminController {
  // ─── Agencies ─────────────────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/agencies
   */
  getAgencies = asyncHandler(async (req, res) => {
    const { search, plan, status, city, page, limit } = req.query;
    const result = await AdminAgencyService.getAllAgencies({ search, plan, status, city, page, limit });
    return ApiResponse.success(res, result, 'Agencies retrieved successfully');
  });

  /**
   * @route POST /api/v1/admin/agencies
   */
  createAgency = asyncHandler(async (req, res) => {
    const agency = await AdminAgencyService.createAgency(req.body);
    return ApiResponse.success(res, agency, 'Agency created successfully', 201);
  });

  /**
   * @route PATCH /api/v1/admin/agencies/:id/status
   */
  updateAgencyStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const agency = await AdminAgencyService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, agency, 'Agency status updated');
  });

  // ─── Users ────────────────────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/users
   */
  getUsers = asyncHandler(async (req, res) => {
    const { search, role, status, page, limit } = req.query;
    const result = await AdminUserService.getAllUsers({ search, role, status, page, limit });
    return ApiResponse.success(res, result, 'Platform users retrieved');
  });

  /**
   * @route PATCH /api/v1/admin/users/:id/status
   */
  updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const user = await AdminUserService.updateStatus(req.params.id, status);
    return ApiResponse.success(res, user, 'User status updated');
  });

  // ─── Subscription Plans ───────────────────────────────────────────────────
  /**
   * @route GET /api/v1/admin/subscription-plans
   */
  getPlans = asyncHandler(async (_req, res) => {
    const plans = await AdminPlanService.getAllPlans();
    return ApiResponse.success(res, plans, 'Subscription plans retrieved');
  });
}

module.exports = new AdminController();
