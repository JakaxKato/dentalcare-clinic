const asyncHandler = require('express-async-handler');
const Article = require('../models/Article');
const ApiError = require('../utils/ApiError');

// @desc    List articles (public sees only published)
// @route   GET /api/articles
const listArticles = asyncHandler(async (req, res) => {
  const filter = {};
  const isStaff = req.user && ['admin', 'dentist'].includes(req.user.role);
  if (!isStaff) filter.published = true;
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

  const articles = await Article.find(filter)
    .populate('authorId', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: articles.length, data: articles });
});

// @desc    Get article by slug
// @route   GET /api/articles/:slug
const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).populate('authorId', 'name avatar');
  if (!article) throw new ApiError(404, 'Article not found');
  const isStaff = req.user && ['admin', 'dentist'].includes(req.user.role);
  if (!article.published && !isStaff) throw new ApiError(404, 'Article not found');
  res.json({ success: true, data: article });
});

// @desc    Create article
// @route   POST /api/articles
const createArticle = asyncHandler(async (req, res) => {
  const article = await Article.create({ ...req.body, authorId: req.user._id });
  res.status(201).json({ success: true, data: article });
});

// @desc    Update article
// @route   PUT /api/articles/:id
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw new ApiError(404, 'Article not found');
  if (req.user.role !== 'admin' && article.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to modify this article');
  }
  const fields = ['title', 'content', 'excerpt', 'coverImage', 'tags', 'published'];
  for (const key of fields) {
    if (req.body[key] !== undefined) article[key] = req.body[key];
  }
  await article.save();
  res.json({ success: true, data: article });
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) throw new ApiError(404, 'Article not found');
  if (req.user.role !== 'admin' && article.authorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this article');
  }
  await article.deleteOne();
  res.json({ success: true, message: 'Article deleted' });
});

module.exports = { listArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
