const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');

// @desc    List services
// @route   GET /api/services
const listServices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === 'true') filter.isActive = true;
  const services = await Service.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: services.length, data: services });
});

// @desc    Get service by slug
// @route   GET /api/services/:slug
const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug });
  if (!service) throw new ApiError(404, 'Service not found');
  res.json({ success: true, data: service });
});

// @desc    Create service
// @route   POST /api/services
const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: service });
});

// @desc    Update service
// @route   PUT /api/services/:id
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  const fields = ['title', 'description', 'priceRange', 'duration', 'image', 'isActive'];
  for (const key of fields) {
    if (req.body[key] !== undefined) service[key] = req.body[key];
  }
  await service.save();
  res.json({ success: true, data: service });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  await service.deleteOne();
  res.json({ success: true, message: 'Service deleted' });
});

module.exports = { listServices, getServiceBySlug, createService, updateService, deleteService };
