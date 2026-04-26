const asyncHandler = require('express-async-handler');
const Testimonial = require('../models/Testimonial');
const ApiError = require('../utils/ApiError');

// @desc    List testimonials (public: approved only; admin: all)
// @route   GET /api/testimonials
const listTestimonials = asyncHandler(async (req, res) => {
  const isAdmin = req.user && req.user.role === 'admin';
  const filter = isAdmin ? {} : { isApproved: true };
  const items = await Testimonial.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: items.length, data: items });
});

// @desc    Submit testimonial (public)
// @route   POST /api/testimonials
const createTestimonial = asyncHandler(async (req, res) => {
  const { patientName, rating, message } = req.body;
  const item = await Testimonial.create({
    patientName,
    rating,
    message,
    isApproved: false,
  });
  res.status(201).json({
    success: true,
    message: 'Thank you! Your testimonial is pending approval.',
    data: item,
  });
});

// @desc    Approve / unapprove testimonial (admin)
// @route   PUT /api/testimonials/:id/approve
const approveTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Testimonial not found');
  item.isApproved = req.body.isApproved !== undefined ? !!req.body.isApproved : true;
  await item.save();
  res.json({ success: true, data: item });
});

// @desc    Delete testimonial (admin)
// @route   DELETE /api/testimonials/:id
const deleteTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Testimonial not found');
  await item.deleteOne();
  res.json({ success: true, message: 'Testimonial deleted' });
});

module.exports = { listTestimonials, createTestimonial, approveTestimonial, deleteTestimonial };
