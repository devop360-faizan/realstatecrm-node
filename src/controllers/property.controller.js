const asyncHandler = require("../utils/asyncHandler");
const PropertyService = require("../services/property.service");
const ApiResponse = require("../utils/ApiResponse");

class PropertyController {
  createProperty = asyncHandler(async (req, res) => {
    req.body = req.body || {};

    // Parse numeric fields from FormData strings to proper types
    if (req.body.price)     req.body.price     = parseFloat(req.body.price);
    if (req.body.bedrooms)  req.body.bedrooms  = parseInt(req.body.bedrooms);
    if (req.body.bathrooms) req.body.bathrooms = parseInt(req.body.bathrooms);
    if (req.body.parking)   req.body.parking   = parseInt(req.body.parking);
    if (req.body.floors)    req.body.floors    = parseInt(req.body.floors);
    if (req.body.size)      req.body.size      = parseFloat(req.body.size);
    if (req.body.builtYear) req.body.builtYear = parseInt(req.body.builtYear);
    if (req.body.isFurnished === 'true')  req.body.isFurnished = true;
    if (req.body.isFurnished === 'false') req.body.isFurnished = false;

    // If amenities are sent as stringified JSON array (not as amenities[0], amenities[1])
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      try { req.body.amenities = JSON.parse(req.body.amenities); } catch (e) {}
    }

    // Strip image-only fields so they don't get passed to the property create query
    const { names, mainIndex, ...propertyBody } = req.body;

    let result = await PropertyService.createProperty(
      req.user.agencyId,
      req.user.id,
      req.user.role,
      propertyBody
    );

    if (req.files && req.files.length > 0) {
      result = await PropertyService.uploadImages(result.id, req.files, names, mainIndex);
    }

    return ApiResponse.success(res, result, "Property created successfully", 201);
  });

  uploadImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return ApiResponse.error(res, "No files uploaded", 400);
    }
    const result = await PropertyService.uploadImages(
      req.params.id,
      req.files,
      req.body.names,
      req.body.mainIndex
    );
    return ApiResponse.success(res, result, "Images uploaded successfully");
  });

  getProperties = asyncHandler(async (req, res) => {
    // Agency users can only see their agency's properties
    const filters = { ...req.query };
    if (req.user.role !== "SUPER_ADMIN") {
      filters.agencyId = req.user.agencyId;
    }
    const result = await PropertyService.getProperties(filters);
    return ApiResponse.success(res, result, "Properties retrieved");
  });

  getPropertyById = asyncHandler(async (req, res) => {
    const result = await PropertyService.getPropertyById(req.params.id);
    return ApiResponse.success(res, result, "Property retrieved");
  });

  updateProperty = asyncHandler(async (req, res) => {
    const result = await PropertyService.updateProperty(req.params.id, req.body);
    return ApiResponse.success(res, result, "Property updated");
  });

  deleteProperty = asyncHandler(async (req, res) => {
    await PropertyService.deleteProperty(req.params.id);
    return ApiResponse.success(res, null, "Property deleted");
  });

  approveListing = asyncHandler(async (req, res) => {
    const result = await PropertyService.approveListing(req.params.id);
    return ApiResponse.success(res, result, "Property approved");
  });
}

module.exports = new PropertyController();