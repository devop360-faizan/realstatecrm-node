const prisma = require('../config/db.config');
const ApiError = require('../utils/ApiError');
const { StatusCodes } = require('http-status-codes');

class AdminUserService {
  /**
   * Get all accounts across all agencies with search, role & status filters
   */
  async getAllUsers({ search, role, status, page = 1, limit = 12 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const where = {};

    if (role) {
      where.role = role.toUpperCase();
    }
    if (status) {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { agency: { name: { contains: search } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          lastSeen: true,
          avatar: true,
          createdAt: true,
          agency: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      agency: u.agency?.name || 'Platform (Super Admin)',
      role: u.role,
      status: u.status,
      lastSeen: u.lastSeen,
      avatar: u.avatar,
      createdAt: u.createdAt,
    }));

    return {
      users: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Suspend or Activate user account
   */
  async updateStatus(id, status) {
    const validStatuses = ['ACTIVE', 'SUSPENDED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status. Must be ACTIVE or SUSPENDED');
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: status.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return user;
  }
}

module.exports = new AdminUserService();
