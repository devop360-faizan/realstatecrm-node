const prisma = require('../config/db.config');

class AdminPlanService {
  /**
   * Get all subscription plans with agency count and calculated monthly revenue
   */
  async getAllPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: { agencies: true },
        },
      },
      orderBy: { price: 'asc' },
    });

    return plans.map((p) => {
      const agenciesCount = p._count.agencies || 0;
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        maxSeats: p.maxSeats >= 999 ? 'Unlimited' : p.maxSeats,
        maxListings: p.maxListings >= 99999 ? 'Unlimited' : p.maxListings,
        maxStorageGB: p.maxStorageGB >= 1000 ? `${p.maxStorageGB / 1000} TB` : `${p.maxStorageGB} GB`,
        agenciesCount,
        monthlyRevenue: agenciesCount * p.price,
        featureFlags: {
          hasDealsCommission: p.hasDealsCommission,
          hasCustomRoles: p.hasCustomRoles,
          hasPortalSyndication: p.hasPortalSyndication,
          hasWhiteLabel: p.hasWhiteLabel,
          hasApiAccess: p.hasApiAccess,
          hasAuditLogSSO: p.hasAuditLogSSO,
          hasAdvancedAnalytics: p.hasAdvancedAnalytics,
        },
      };
    });
  }
}

module.exports = new AdminPlanService();
