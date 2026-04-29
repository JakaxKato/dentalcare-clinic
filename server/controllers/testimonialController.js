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

// @desc    List testimonials owned by the logged-in user
// @route   GET /api/testimonials/my-testimonials
const listMyTestimonials = asyncHandler(async (req, res) => {
  const items = await Testimonial.find({ patientId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: items.length, data: items });
});

// @desc    Submit testimonial. Auto-fills patient info if authenticated.
// @route   POST /api/testimonials
const createTestimonial = asyncHandler(async (req, res) => {
  const { rating, message } = req.body;
  let patientName = req.body.patientName;
  let patientId;
  if (req.user) {
    patientId = req.user._id;
    patientName = req.user.name;
  }
  const item = await Testimonial.create({
    patientId,
    patientName,
    rating,
    message,
    isApproved: false,
  });
  res.status(201).json({
    success: true,
    message: 'Terima kasih! Testimoni Anda menunggu persetujuan admin.',
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

// @desc    Delete testimonial (admin or owner if still pending)
// @route   DELETE /api/testimonials/:id
const deleteTestimonial = asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Testimonial not found');
  const isAdmin = req.user.role === 'admin';
  const isOwner = item.patientId && String(item.patientId) === String(req.user._id);
  if (!isAdmin && !(isOwner && !item.isApproved)) {
    throw new ApiError(403, 'Not allowed to delete this testimonial');
  }
  await item.deleteOne();
  res.json({ success: true, message: 'Testimonial deleted' });
});

module.exports = {
  listTestimonials,
  listMyTestimonials,
  createTestimonial,
  approveTestimonial,
  deleteTestimonial,
};
