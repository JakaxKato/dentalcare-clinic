const ApiError = require('../utils/ApiError');

// @desc    Upload single image; returns URL
// @route   POST /api/upload
const uploadImage = (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No file uploaded'));
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, data: { url, filename: req.file.filename } });
};

module.exports = { uploadImage };
