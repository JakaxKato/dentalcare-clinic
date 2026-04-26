const express = require('express');
const {
  listServices, getServiceBySlug, createService, updateService, deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { validateService } = require('../validators');

const router = express.Router();

router.get('/', listServices);
router.get('/:slug', getServiceBySlug);
router.post('/', protect, authorize('admin'), validateService, createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
