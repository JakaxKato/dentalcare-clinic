const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { hasCloudinary } = require('../config/env');

const ALLOWED_EXT = /jpeg|jpg|png|webp|gif/;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const fileFilter = (_req, file, cb) => {
  const extensionAllowed = ALLOWED_EXT.test(path.extname(file.originalname).toLowerCase());
  const mimeAllowed = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
  if (extensionAllowed && mimeAllowed) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
};

const isCloudinary = hasCloudinary();
let storage;
if (isCloudinary) {
  storage = multer.memoryStorage();
  console.log('[upload] Using Cloudinary upload stream');
} else {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  });
  console.log('[upload] Using local disk storage (dev) - set CLOUDINARY_* env for cloud uploads');
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES },
});

upload.isCloudinary = isCloudinary;

module.exports = upload;
