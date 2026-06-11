const ApiError = require('../utils/ApiError');
const upload = require('../middleware/upload');

// @desc    Upload single image; returns URL
// @route   POST /api/upload
const uploadImage = (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'No file uploaded'));

  const url = upload.isCloudinary
    ? req.file.path
    : `/uploads/${req.file.filename}`;

  const filename = req.file.filename || req.file.originalname;
  const publicId = upload.isCloudinary ? req.file.filename : undefined;

  res.status(201).json({ success: true, data: { url, filename, publicId } });
};

module.exports = { uploadImage };
