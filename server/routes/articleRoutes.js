const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  listArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle,
} = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');
const { validateArticle } = require('../validators');

const router = express.Router();

// Optional auth: attach req.user if token present (used for staff seeing unpublished)
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

router.get('/', optionalAuth, listArticles);
router.get('/:slug', optionalAuth, getArticleBySlug);
router.post('/', protect, authorize('admin', 'dentist'), validateArticle, createArticle);
router.put('/:id', protect, authorize('admin', 'dentist'), updateArticle);
router.delete('/:id', protect, authorize('admin', 'dentist'), deleteArticle);

module.exports = router;
