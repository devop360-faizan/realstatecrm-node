const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const AdminVocabularyService = require("../services/adminVocabulary.service");

class AdminVocabularyController {
  // --- Property Types ---
  getPropertyTypes = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.getPropertyTypes(req.query), "Property Types retrieved");
  });
  createPropertyType = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.createPropertyType(req.body), "Property Type created", 201);
  });
  updatePropertyType = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.updatePropertyType(req.params.id, req.body), "Property Type updated");
  });
  deletePropertyType = asyncHandler(async (req, res) => {
    await AdminVocabularyService.deletePropertyType(req.params.id);
    return ApiResponse.success(res, null, "Property Type deleted");
  });

  // --- Property Categories ---
  getCategories = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.getCategories(req.query), "Categories retrieved");
  });
  createCategory = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.createCategory(req.body), "Category created", 201);
  });
  updateCategory = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.updateCategory(req.params.id, req.body), "Category updated");
  });
  deleteCategory = asyncHandler(async (req, res) => {
    await AdminVocabularyService.deleteCategory(req.params.id);
    return ApiResponse.success(res, null, "Category deleted");
  });

  // --- Listing Statuses ---
  getListingStatuses = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.getListingStatuses(req.query), "Statuses retrieved");
  });
  createListingStatus = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.createListingStatus(req.body), "Status created", 201);
  });
  updateListingStatus = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.updateListingStatus(req.params.id, req.body), "Status updated");
  });
  deleteListingStatus = asyncHandler(async (req, res) => {
    await AdminVocabularyService.deleteListingStatus(req.params.id);
    return ApiResponse.success(res, null, "Status deleted");
  });

  // --- Amenities ---
  getAmenities = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.getAmenities(req.query), "Amenities retrieved");
  });
  createAmenity = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.createAmenity(req.body), "Amenity created", 201);
  });
  updateAmenity = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.updateAmenity(req.params.id, req.body), "Amenity updated");
  });
  deleteAmenity = asyncHandler(async (req, res) => {
    await AdminVocabularyService.deleteAmenity(req.params.id);
    return ApiResponse.success(res, null, "Amenity deleted");
  });

  // --- Lead Sources ---
  getLeadSources = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.getLeadSources(req.query), "Lead Sources retrieved");
  });
  createLeadSource = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.createLeadSource(req.body), "Lead Source created", 201);
  });
  updateLeadSource = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, await AdminVocabularyService.updateLeadSource(req.params.id, req.body), "Lead Source updated");
  });
  deleteLeadSource = asyncHandler(async (req, res) => {
    await AdminVocabularyService.deleteLeadSource(req.params.id);
    return ApiResponse.success(res, null, "Lead Source deleted");
  });
}

module.exports = new AdminVocabularyController();
