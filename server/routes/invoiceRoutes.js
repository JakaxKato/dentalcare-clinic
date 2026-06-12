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

const router = express.Router();

router.post('/', protect, authorize('admin', 'dentist'), createInvoice);
router.get('/', protect, listInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/pdf', protect, downloadPdf);
router.put('/:id', protect, authorize('admin', 'dentist'), updateInvoice);
router.put('/:id/payment', protect, authorize('admin'), updatePayment);
router.delete('/:id', protect, authorize('admin'), deleteInvoice);

module.exports = router;
