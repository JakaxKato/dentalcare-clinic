const express = require('express');
const {
  createPrescription,
  listPrescriptions,
  getPrescription,
  updatePrescription,
  deletePrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('admin', 'dentist'), createPrescription);
router.get('/', protect, listPrescriptions);
router.get('/:id', protect, getPrescription);
router.put('/:id', protect, authorize('admin', 'dentist'), updatePrescription);
router.delete('/:id', protect, authorize('admin'), deletePrescription);

module.exports = router;
