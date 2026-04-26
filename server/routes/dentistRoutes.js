const express = require('express');
const {
  listDentists, getDentist, createDentist, updateDentist, deleteDentist,
} = require('../controllers/dentistController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', listDentists);
router.get('/:id', getDentist);
router.post('/', protect, authorize('admin'), createDentist);
router.put('/:id', protect, authorize('admin'), updateDentist);
router.delete('/:id', protect, authorize('admin'), deleteDentist);

module.exports = router;
