const prisma = require("../config/db.config");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");

const generateSlug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

class AdminVocabularyService {
  // --- Property Types ---
  async getPropertyTypes({ page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.propertyType.findMany({
        skip,
        take: limit,
        include: { _count: { select: { categories: true } } },
      }),
      prisma.propertyType.count()
    ]);
    
    return {
      propertyTypes: data.map((item) => ({ ...item, inUseBy: 0 })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
  async createPropertyType({ name, status }) {
    const slug = generateSlug(name);
    return prisma.propertyType.create({ data: { name, slug, status } });
  }
  async updatePropertyType(id, data) {
    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.status) updateData.status = data.status;
    return prisma.propertyType.update({ where: { id }, data: updateData });
  }
  async deletePropertyType(id) {
    return prisma.propertyType.delete({ where: { id } });
  }

  // --- Property Categories ---
  async getCategories({ page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.propertyCategory.findMany({
        skip,
        take: limit,
        include: { propertyType: true },
      }),
      prisma.propertyCategory.count()
    ]);

    return {
      categories: data.map((item) => ({ ...item, inUseBy: 0 })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
  async createCategory({ name, propertyTypeId, status }) {
    const slug = generateSlug(name);
    return prisma.propertyCategory.create({
      data: { name, slug, propertyTypeId, status },
    });
  }
  async updateCategory(id, data) {
    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.status) updateData.status = data.status;
    if (data.propertyTypeId) updateData.propertyTypeId = data.propertyTypeId;
    return prisma.propertyCategory.update({ where: { id }, data: updateData });
  }
  async deleteCategory(id) {
    return prisma.propertyCategory.delete({ where: { id } });
  }

  // --- Listing Statuses ---
  async getListingStatuses({ page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.listingStatus.findMany({ skip, take: limit }),
      prisma.listingStatus.count()
    ]);

    return {
      listingStatuses: data.map((item) => ({ ...item, inUseBy: 0 })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
  async createListingStatus({ name, colorCode, status }) {
    const slug = generateSlug(name);
    return prisma.listingStatus.create({
      data: { name, slug, colorCode, status },
    });
  }
  async updateListingStatus(id, data) {
    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.status) updateData.status = data.status;
    if (data.colorCode) updateData.colorCode = data.colorCode;
    return prisma.listingStatus.update({ where: { id }, data: updateData });
  }
  async deleteListingStatus(id) {
    return prisma.listingStatus.delete({ where: { id } });
  }

  // --- Amenities ---
  async getAmenities({ page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.amenity.findMany({ skip, take: limit }),
      prisma.amenity.count()
    ]);

    return {
      amenities: data.map((item) => ({ ...item, inUseBy: 0 })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
  async createAmenity({ name, icon, status }) {
    const slug = generateSlug(name);
    return prisma.amenity.create({ data: { name, slug, icon, status } });
  }
  async updateAmenity(id, data) {
    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.status) updateData.status = data.status;
    if (data.icon) updateData.icon = data.icon;
    return prisma.amenity.update({ where: { id }, data: updateData });
  }
  async deleteAmenity(id) {
    return prisma.amenity.delete({ where: { id } });
  }

  // --- Lead Sources ---
  async getLeadSources({ page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.leadSource.findMany({ skip, take: limit }),
      prisma.leadSource.count()
    ]);

    return {
      leadSources: data.map((item) => ({ ...item, inUseBy: 0 })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
  async createLeadSource({ name, status }) {
    const slug = generateSlug(name);
    return prisma.leadSource.create({ data: { name, slug, status } });
  }
  async updateLeadSource(id, data) {
    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.status) updateData.status = data.status;
    return prisma.leadSource.update({ where: { id }, data: updateData });
  }
  async deleteLeadSource(id) {
    return prisma.leadSource.delete({ where: { id } });
  }
}

module.exports = new AdminVocabularyService();
