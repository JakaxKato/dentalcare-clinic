const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { hasCloudinary } = require('../config/env');

const ALLOWED_EXT = /jpeg|jpg|png|webp|gif/;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ok = ALLOWED_EXT.test(path.extname(file.originalname).toLowerCase()) && ALLOWED_EXT.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
};

let storage;
let isCloudinary = false;

if (hasCloudinary()) {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: process.env.CLOUDINARY_FOLDER || 'dentalcare',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1600, height: 1600, crop: 'limit' }],
    },
  });
  isCloudinary = true;
  console.log('[upload] Using Cloudinary storage');
} else {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
  console.log('[upload] Using local disk storage (dev) — set CLOUDINARY_* env for cloud uploads');
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES },
});

upload.isCloudinary = isCloudinary;

module.exports = upload;
