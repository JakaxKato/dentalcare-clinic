const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  listTestimonials,
  listMyTestimonials,
  createTestimonial,
  approveTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/auth');
const { validateTestimonial } = require('../validators');

const router = express.Router();

const optionalAuth = async (req, _res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) req.user = user;
    } catch (_) { /* ignore */ }
  }
  next();
};

router.get('/', optionalAuth, listTestimonials);
router.get('/my-testimonials', protect, listMyTestimonials);
router.post('/', optionalAuth, validateTestimonial, createTestimonial);
router.put('/:id/approve', protect, authorize('admin'), approveTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
