const express = require('express');
const { getPublicSettings, updateSettings } = require('../controllers/clinicSettingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPublicSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
