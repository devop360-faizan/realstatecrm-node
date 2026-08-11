const prisma = require("../config/db.config");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require("http-status-codes");
const S3Service = require("./s3.service");

class PropertyService {
  /**
   * Create a new property
   */
  async createProperty(agencyId, userId, role, data) {
    const prefix = data.type === "RENT" ? "RNT" : "SLS";
    const refNum = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    let approvalStatus = "PENDING";
    if (role === "AGENCY_OWNER" || role === "OFFICE_MANAGER" || role === "SUPER_ADMIN") {
      approvalStatus = "APPROVED";
    }

    const { amenities, ...propertyData } = data;

    const createQuery = {
      ...propertyData,
      referenceNumber: refNum,
      approvalStatus,
      agencyId,
      createdById: userId,
      assignedToId: userId,
    };

    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      createQuery.amenities = {
        create: amenities.map(amenityId => ({
          amenity: { connect: { id: amenityId } }
        }))
      };
    }

    const property = await prisma.property.create({
      data: createQuery,
      include: {
        images: true,
        propertyType: true,
        category: true,
        listingStatus: true,
        amenities: { include: { amenity: true } }
      }
    });

    return property;
  }

  /**
   * Upload and attach images to a property
   * FormData fields:
   *   - images: (multiple files)
   *   - names:  (optional JSON array, e.g. ["Floor plan — level 1", "Elevation 1"])
   *   - mainIndex: (optional number, which file index is the main/cover image, default 0)
   */
  async uploadImages(propertyId, files, namesJson, mainIndex = 0) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new ApiError(StatusCodes.NOT_FOUND, "Property not found");

    // Parse optional names array
    let names = [];
    if (namesJson) {
      try {
        names = JSON.parse(namesJson);
      } catch {
        // If not valid JSON, ignore — names will just be null
      }
    }

    // Check if property already has images (to determine isMain logic)
    const existingCount = await prisma.propertyImage.count({ where: { propertyId } });

    const uploadPromises = files.map(file => S3Service.uploadFile(file, "properties"));
    const results = await Promise.all(uploadPromises);

    const imagesToCreate = results.map((res, index) => ({
      url:       res.url,
      name:      names[index] || null,
      isMain:    existingCount === 0 && index === parseInt(mainIndex), // Only first-ever upload sets isMain
      sortOrder: existingCount + index,
      propertyId
    }));

    await prisma.propertyImage.createMany({ data: imagesToCreate });

    return prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: { orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }] }
      }
    });
  }

  /**
   * Get all properties (paginated, filtered)
   */
  async getProperties({ agencyId, type, listingStatusSlug, approvalStatus, city, propertyTypeSlug, page = 1, limit = 10 }) {
    page = Math.max(1, parseInt(page));
    limit = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (page - 1) * limit;

    const where = {};
    if (agencyId) where.agencyId = agencyId;
    if (type) where.type = type.toUpperCase();
    if (approvalStatus) where.approvalStatus = approvalStatus.toUpperCase();
    if (listingStatusSlug) where.listingStatus = { slug: listingStatusSlug.toLowerCase() };
    if (city) where.city = { contains: city };
    if (propertyTypeSlug) where.propertyType = { slug: propertyTypeSlug.toLowerCase() };

    const [data, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          type: true,
          price: true,
          city: true,
          location: true,
          bedrooms: true,
          bathrooms: true,
          size: true,
          category: { select: { name: true } },
          listingStatus: { select: { name: true, colorCode: true } },
          images: { select: { url: true }, where: { isMain: true }, take: 1 },
        }
      }),
      prisma.property.count({ where })
    ]);

    return {
      properties: data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getPropertyById(id) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }]
        },
        propertyType: { select: { name: true, slug: true } },
        category:     { select: { name: true, slug: true } },
        listingStatus: { select: { name: true, colorCode: true } },
        amenities: {
          include: { amenity: { select: { name: true, slug: true, icon: true } } }
        },
        createdBy:  { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        agency:     { select: { id: true, name: true, city: true } },

        // Leads tab: clients interested in this property
        leads: {
          include: {
            client: {
              select: {
                id: true, firstName: true, lastName: true,
                phone: true, type: true, stage: true, budget: true,
                source: { select: { name: true } },
                assignedTo: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },

        // Viewings tab: appointments booked for this property
        viewings: {
          include: {
            client:     { select: { firstName: true, lastName: true, phone: true } },
            assignedTo: { select: { name: true } }
          },
          orderBy: { startAt: 'desc' }
        },

        // Price history panel
        priceHistory: {
          orderBy: { createdAt: 'desc' }
        },

        // Activity tab
        activities: {
          include: { user: { select: { name: true } } },
          orderBy:  { createdAt: 'desc' }
        }
      }
    });

    if (!property) throw new ApiError(StatusCodes.NOT_FOUND, "Property not found");

    // Documents: polymorphic query — fetched separately
    const documents = await prisma.document.findMany({
      where: { attachedToType: 'PROPERTY', attachedToId: id },
      include: { uploadedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return { ...property, documents };
  }

  async updateProperty(id, data) {
    const { amenities, ...propertyData } = data;
    
    return prisma.property.update({
      where: { id },
      data: propertyData,
    });
  }

  async deleteProperty(id) {
    return prisma.property.delete({ where: { id } });
  }

  async approveListing(id) {
    return prisma.property.update({
      where: { id },
      data: { approvalStatus: "APPROVED" }
    });
  }
}

module.exports = new PropertyService();
