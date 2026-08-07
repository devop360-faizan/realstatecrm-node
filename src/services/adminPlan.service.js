const prisma = require("../config/db.config");
const stripeService = require("./stripe.service");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

class AdminPlanService {
  /**
   * Get all subscription plans with agency count and calculated MRR & ARR
   */
  async getAllPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { agencies: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return plans.map((p) => {
      const agenciesCount = p._count.agencies || 0;
      const mPrice = p.monthlyPrice !== undefined ? p.monthlyPrice : (p.price || 0);
      const yPrice = p.yearlyPrice !== undefined ? p.yearlyPrice : mPrice * 12;

      return {
        id: p.id,
        name: p.name,
        description: p.description || null,
        monthlyPrice: mPrice,
        yearlyPrice: yPrice,
        maxSeats: p.maxSeats >= 999 ? "Unlimited" : p.maxSeats,
        maxListings: p.maxListings >= 99999 ? "Unlimited" : p.maxListings,
        maxStorageGB:
          p.maxStorageGB >= 1000 ? `${p.maxStorageGB / 1000} TB` : `${p.maxStorageGB} GB`,
        agenciesCount,
        monthlyRevenue: agenciesCount * mPrice,
        stripeProductId: p.stripeProductId || null,
        stripePriceIdMonthly: p.stripePriceIdMonthly || null,
        stripePriceIdYearly: p.stripePriceIdYearly || null,
        featureFlags: {
          hasDealsCommission: p.hasDealsCommission,
          hasCustomRoles: p.hasCustomRoles,
          hasPortalSyndication: p.hasPortalSyndication,
          hasWhiteLabel: p.hasWhiteLabel,
          hasApiAccess: p.hasApiAccess,
          hasAuditLogSSO: p.hasAuditLogSSO,
          hasAdvancedAnalytics: p.hasAdvancedAnalytics,
        },
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });
  }

  /**
   * Get Single Plan By ID
   */
  async getSinglePlanById(id) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: { select: { agencies: true } },
      },
    });

    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Subscription plan not found");
    }

    return plan;
  }

  /**
   * Create New Subscription Plan + Sync to Stripe (Monthly & Yearly)
   */
  async createPlan(data) {
    const {
      name,
      description,
      monthlyPrice = 0,
      yearlyPrice = 0,
      maxSeats = 5,
      maxListings = 150,
      maxStorageGB = 20,
      hasDealsCommission = false,
      hasCustomRoles = false,
      hasPortalSyndication = false,
      hasWhiteLabel = false,
      hasApiAccess = false,
      hasAuditLogSSO = false,
      hasAdvancedAnalytics = false,
    } = data;

    if (!name || !name.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Plan name is required");
    }

    const trimmedName = name.trim();

    // Check unique name using findFirst
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: trimmedName },
    });
    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Subscription plan with name "${trimmedName}" already exists`,
      );
    }

    const finalMonthlyPrice = Number(monthlyPrice);
    const finalYearlyPrice = yearlyPrice ? Number(yearlyPrice) : finalMonthlyPrice * 12;

    // 1. Sync to Stripe
    const stripeResult = await stripeService.createPlanOnStripe({
      name: trimmedName,
      monthlyPrice: finalMonthlyPrice,
      yearlyPrice: finalYearlyPrice,
      description,
    });

    // 2. Save in Database
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: trimmedName,
        description: description || null,
        monthlyPrice: finalMonthlyPrice,
        yearlyPrice: finalYearlyPrice,
        maxSeats: Number(maxSeats),
        maxListings: Number(maxListings),
        maxStorageGB: Number(maxStorageGB),
        hasDealsCommission: Boolean(hasDealsCommission),
        hasCustomRoles: Boolean(hasCustomRoles),
        hasPortalSyndication: Boolean(hasPortalSyndication),
        hasWhiteLabel: Boolean(hasWhiteLabel),
        hasApiAccess: Boolean(hasApiAccess),
        hasAuditLogSSO: Boolean(hasAuditLogSSO),
        hasAdvancedAnalytics: Boolean(hasAdvancedAnalytics),
        stripeProductId: stripeResult.stripeProductId,
        stripePriceIdMonthly: stripeResult.stripePriceIdMonthly,
        stripePriceIdYearly: stripeResult.stripePriceIdYearly,
      },
    });

    return plan;
  }

  /**
   * Update Existing Subscription Plan + Sync to Stripe
   */
  async updatePlan(id, data) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existingPlan) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Subscription plan not found");
    }

    const newName = data.name ? data.name.trim() : existingPlan.name;

    if (newName !== existingPlan.name) {
      const duplicate = await prisma.subscriptionPlan.findFirst({
        where: { name: newName },
      });
      if (duplicate) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          `Subscription plan with name "${newName}" already exists`,
        );
      }
    }

    const newMonthlyPrice = data.monthlyPrice !== undefined ? Number(data.monthlyPrice) : (existingPlan.monthlyPrice || existingPlan.price || 0);
    const newYearlyPrice = data.yearlyPrice !== undefined ? Number(data.yearlyPrice) : (existingPlan.yearlyPrice || newMonthlyPrice * 12);

    const monthlyPriceChanged = newMonthlyPrice !== existingPlan.monthlyPrice;
    const yearlyPriceChanged = newYearlyPrice !== existingPlan.yearlyPrice;

    // 1. Sync to Stripe
    let stripePriceIdMonthly = existingPlan.stripePriceIdMonthly;
    let stripePriceIdYearly = existingPlan.stripePriceIdYearly;

    if (existingPlan.stripeProductId) {
      const stripeUpdate = await stripeService.updatePlanOnStripe({
        stripeProductId: existingPlan.stripeProductId,
        stripePriceIdMonthly: existingPlan.stripePriceIdMonthly,
        stripePriceIdYearly: existingPlan.stripePriceIdYearly,
        name: newName,
        monthlyPrice: newMonthlyPrice,
        yearlyPrice: newYearlyPrice,
        monthlyPriceChanged,
        yearlyPriceChanged,
      });
      stripePriceIdMonthly = stripeUpdate.stripePriceIdMonthly;
      stripePriceIdYearly = stripeUpdate.stripePriceIdYearly;
    }

    // 2. Update Database
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: newName,
        description: data.description !== undefined ? data.description : existingPlan.description,
        monthlyPrice: newMonthlyPrice,
        yearlyPrice: newYearlyPrice,
        maxSeats: data.maxSeats !== undefined ? Number(data.maxSeats) : existingPlan.maxSeats,
        maxListings: data.maxListings !== undefined ? Number(data.maxListings) : existingPlan.maxListings,
        maxStorageGB: data.maxStorageGB !== undefined ? Number(data.maxStorageGB) : existingPlan.maxStorageGB,
        hasDealsCommission: data.hasDealsCommission !== undefined ? Boolean(data.hasDealsCommission) : existingPlan.hasDealsCommission,
        hasCustomRoles: data.hasCustomRoles !== undefined ? Boolean(data.hasCustomRoles) : existingPlan.hasCustomRoles,
        hasPortalSyndication: data.hasPortalSyndication !== undefined ? Boolean(data.hasPortalSyndication) : existingPlan.hasPortalSyndication,
        hasWhiteLabel: data.hasWhiteLabel !== undefined ? Boolean(data.hasWhiteLabel) : existingPlan.hasWhiteLabel,
        hasApiAccess: data.hasApiAccess !== undefined ? Boolean(data.hasApiAccess) : existingPlan.hasApiAccess,
        hasAuditLogSSO: data.hasAuditLogSSO !== undefined ? Boolean(data.hasAuditLogSSO) : existingPlan.hasAuditLogSSO,
        hasAdvancedAnalytics: data.hasAdvancedAnalytics !== undefined ? Boolean(data.hasAdvancedAnalytics) : existingPlan.hasAdvancedAnalytics,
        stripePriceIdMonthly,
        stripePriceIdYearly,
      },
    });

    return updatedPlan;
  }
}

module.exports = new AdminPlanService();
