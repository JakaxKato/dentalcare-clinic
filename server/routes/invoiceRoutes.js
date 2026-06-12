const express = require('express');
const {
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  updatePayment,
  deleteInvoice,
  downloadPdf,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');
const { validateInvoice } = require('../validators');

const router = express.Router();

router.post('/', protect, authorize('admin', 'dentist'), validateInvoice, createInvoice);
router.get('/', protect, listInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/pdf', protect, downloadPdf);
router.put('/:id', protect, authorize('admin', 'dentist'), validateInvoice, updateInvoice);
router.put('/:id/payment', protect, authorize('admin'), updatePayment);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);

module.exports = router;
