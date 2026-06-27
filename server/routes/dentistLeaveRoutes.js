const express = require('express');
const {
  createLeave,
  listLeaves,
  deleteLeave,
  checkLeave,
} = require('../controllers/dentistLeaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public: check if a dentist is on leave for a date
router.get('/check', checkLeave);

// Authenticated routes
router.get('/',    protect, authorize('dentist', 'admin'), listLeaves);
router.post('/',   protect, authorize('dentist', 'admin'), createLeave);
router.delete('/:id', protect, authorize('dentist', 'admin'), deleteLeave);

module.exports = router;
