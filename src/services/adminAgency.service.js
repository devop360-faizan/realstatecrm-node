const prisma = require('../config/db.config');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');

class AdminAgencyService {
  /**
   * Get all agencies with search, filter (plan, status, city), pagination & metrics
   */
  async getAllAgencies({ search, plan, status, city, page = 1, limit = 12 }) {
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
            select: { id: true, name: true, price: true },
          },
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agency.count({ where }),
    ]);

    const formattedAgencies = agencies.map((a, index) => ({
      index: String(skip + index + 1).padStart(2, '0'),
      id: a.id,
      name: a.name,
      city: a.city,
      ownerName: a.ownerName || 'Unassigned',
      plan: a.subscriptionPlan?.name || 'Starter',
      price: a.subscriptionPlan?.price || 99,
      status: a.status,
      seats: a.seatsCount || a._count.users || 1,
      listings: 0,
      storageGB: a.storageUsedGB || 0.0,
      renewsAt: a.renewsAt || null,
      mrr: a.mrr || a.subscriptionPlan?.price || 99,
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
   * Create new Agency + Agency Owner User in 1 Atomic Transaction
   */
  async createAgency({ name, city, ownerName, ownerEmail, ownerPassword, planId }) {
    if (!name || !ownerEmail || !ownerPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency Name, Owner Email, and Owner Password are required');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check existing agency or email
    const existingAgency = await prisma.agency.findUnique({ where: { slug } });
    if (existingAgency) {
      throw new ApiError(StatusCodes.CONFLICT, 'Agency with this name already exists');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail.toLowerCase() } });
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    // Atomic Transaction: Create Agency + Agency Owner User
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Agency
      const agency = await tx.agency.create({
        data: {
          name,
          slug,
          city: city || 'Karachi',
          ownerName: ownerName || 'Agency Owner',
          subscriptionPlanId: planId || 'starter-plan-uuid',
          status: 'ACTIVE',
        },
        include: {
          subscriptionPlan: true,
        },
      });

      // 2. Create Owner User
      const ownerUser = await tx.user.create({
        data: {
          agencyId: agency.id,
          name: ownerName || 'Agency Owner',
          email: ownerEmail.toLowerCase(),
          password: hashedPassword,
          role: 'AGENCY_OWNER',
          status: 'ACTIVE',
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
   * Update Agency Status (ACTIVE, PAST_DUE, SUSPENDED, TRIAL)
   */
  async updateStatus(id, status) {
    const validStatuses = ['ACTIVE', 'PAST_DUE', 'SUSPENDED', 'TRIAL'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const agency = await prisma.agency.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    return agency;
  }
}

module.exports = new AdminAgencyService();
