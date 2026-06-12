const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createDpTransaction,
  confirmDpDev,
  handleNotification,
  getDpStatus,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/notification', handleNotification);
router.get('/appointment/:id/dp', protect, getDpStatus);
router.post('/appointment/:id/dp', protect, authorize('patient'), createDpTransaction);
router.post('/appointment/:id/dp/confirm', protect, authorize('patient', 'admin'), confirmDpDev);

module.exports = router;
