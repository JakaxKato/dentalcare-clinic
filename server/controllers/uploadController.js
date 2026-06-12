const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const upload = require('../middleware/upload');

let cloudinary;
if (upload.isCloudinary) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'dentalcare',
        resource_type: 'image',
        transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });

// @desc    Upload single image; returns URL
// @route   POST /api/upload
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  if (upload.isCloudinary) {
    const result = await uploadToCloudinary(req.file);
    return res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        filename: result.original_filename || req.file.originalname,
        publicId: result.public_id,
      },
    });
  }

  res.status(201).json({
    success: true,
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    },
  });
});

module.exports = { uploadImage };
