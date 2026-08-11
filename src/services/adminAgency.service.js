const prisma = require("../config/db.config");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");

class AdminAgencyService {
  /**
   * Get all agencies with search, filter (plan, status, city), pagination & metrics
   */
  async getAllAgencies({ search, plan, status, city, page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }
    if (city) {
      where.city = { contains: city };
    }
    if (plan) {
      where.subscriptionPlan = { name: { equals: plan } };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { ownerName: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const [agencies, total] = await Promise.all([
      prisma.agency.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscriptionPlan: {
            select: { id: true, name: true, monthlyPrice: true },
          },
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.agency.count({ where }),
    ]);

    const formattedAgencies = agencies.map((a, index) => ({
      index: String(skip + index + 1).padStart(2, "0"),
      id: a.id,
      name: a.name,
      city: a.city,
      ownerName: a.ownerName || "Unassigned",
      plan: a.subscriptionPlan?.name || "Starter",
      price: a.subscriptionPlan?.monthlyPrice || 99,
      status: a.status,
      seats: a.seatsCount || a._count.users || 1,
      listings: 0,
      storageGB: a.storageUsedGB || 0.0,
      renewsAt: a.renewsAt || null,
      mrr: a.mrr || a.subscriptionPlan?.monthlyPrice || 99,
      createdAt: a.createdAt,
    }));

    return {
      agencies: formattedAgencies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Export all agencies as CSV string
   */
  async exportAgenciesCSV({ search, plan, status, city }) {
    const where = {};

    if (status) where.status = status.toUpperCase();
    if (city) where.city = { contains: city };
    if (plan) where.subscriptionPlan = { name: { equals: plan } };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { ownerName: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const agencies = await prisma.agency.findMany({
      where,
      include: {
        subscriptionPlan: { select: { name: true, price: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Index", "Agency Name", "City", "Owner Name", "Plan", "Status", "Seats", "Storage (GB)", "MRR ($)", "Joined Date"];
    const rows = agencies.map((a, idx) => [
      idx + 1,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.city.replace(/"/g, '""')}"`,
      `"${(a.ownerName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${a.subscriptionPlan?.name || 'Starter'}"`,
      a.status,
      a.seatsCount || a._count.users || 1,
      a.storageUsedGB || 0.0,
      a.mrr || a.subscriptionPlan?.price || 99,
      new Date(a.createdAt).toISOString().split('T')[0],
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Create new Agency + Agency Owner User in 1 Atomic Transaction
   */
  async createAgency({
    name,
    city,
    ownerName,
    ownerEmail,
    ownerPassword,
    planId,
  }) {
    if (!name || !ownerEmail || !ownerPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Agency Name, Owner Email, and Owner Password are required",
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existingAgency = await prisma.agency.findUnique({ where: { slug } });
    if (existingAgency) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Agency with this name already exists",
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail.toLowerCase() },
    });
    if (existingUser) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "User with this email already exists",
      );
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name,
          slug,
          city: city || "Karachi",
          ownerName: ownerName || "Agency Owner",
          subscriptionPlanId: planId || null,
          status: "ACTIVE",
        },
        include: {
          subscriptionPlan: true,
        },
      });

      const ownerUser = await tx.user.create({
        data: {
          agencyId: agency.id,
          name: ownerName || "Agency Owner",
          email: ownerEmail.toLowerCase(),
          password: hashedPassword,
          role: "AGENCY_OWNER",
          status: "ACTIVE",
        },
      });

      return { agency, ownerUser };
    });

    delete result.ownerUser.password;

    return {
      agency: result.agency,
      ownerUser: {
        id: result.ownerUser.id,
        name: result.ownerUser.name,
        email: result.ownerUser.email,
        role: result.ownerUser.role,
        status: result.ownerUser.status,
      },
    };
  }

  /**
   * Get single agency details matching exact UI View Screen
   */
  async getSingleAgencyById(id) {
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        subscriptionPlan: true,
        users: {
          where: { role: "AGENCY_OWNER" },
          select: { id: true, name: true, email: true, avatar: true },
          take: 1,
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!agency) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Agency workspace not found");
    }

    const owner = agency.users[0] || null;
    const plan = agency.subscriptionPlan;

    return {
      tenancyId: agency.id.slice(0, 8),
      id: agency.id,
      name: agency.name,
      city: agency.city,
      status: agency.status,
      joinedAt: agency.createdAt,

      metrics: {
        seatsUsed: agency._count.users || 1,
        seatsLimit: plan?.maxSeats || 60,
        listingsCount: 0,
        listingsLimit: plan?.maxListings || 5000,
        storageUsedGB: agency.storageUsedGB || 0.0,
        storageLimitGB: plan?.maxStorageGB || 2000,
        mrr: agency.mrr || plan?.price || 99,
        renewsAt: agency.renewsAt || null,
      },

      billing: {
        planName: plan?.name || "Enterprise",
        billingCycle: "Monthly",
        nextCharge: plan?.price || 899,
        renewsAt: agency.renewsAt || null,
        lifetimeValue: (plan?.price || 899) * 14,
      },

      owner: owner
        ? {
            id: owner.id,
            name: owner.name,
            email: owner.email,
            avatar: owner.avatar,
          }
        : null,

      recentTenancyEvents: [
        {
          event: `Plan set to ${plan?.name || "Enterprise"}`,
          date: agency.updatedAt,
        },
        { event: `Workspace created`, date: agency.createdAt },
      ],
    };
  }

  /**
   * Change Agency Subscription Plan
   */
  async changePlan(id, planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Subscription plan not found");
    }

    const updatedAgency = await prisma.agency.update({
      where: { id },
      data: {
        subscriptionPlanId: plan.id,
        mrr: plan.price,
      },
      include: {
        subscriptionPlan: true,
      },
    });

    return updatedAgency;
  }

  /**
   * Suspend / Activate Agency Workspace
   */
  async updateStatus(id, status) {
    const validStatuses = ["ACTIVE", "PAST_DUE", "SUSPENDED", "TRIAL"];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const agency = await prisma.agency.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    return agency;
  }
}

module.exports = new AdminAgencyService();
