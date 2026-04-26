const express = require('express');
const {
  createAppointment, listAppointments, myAppointments, getAppointment,
  updateStatus, rescheduleAppointment, deleteAppointment, stats,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validateAppointment } = require('../validators');

const router = express.Router();

router.post('/', protect, authorize('patient', 'admin'), validateAppointment, createAppointment);
router.get('/', protect, authorize('admin', 'dentist'), listAppointments);
router.get('/stats', protect, authorize('admin'), stats);
router.get('/my-appointments', protect, authorize('patient'), myAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, updateStatus);
router.put('/:id/reschedule', protect, rescheduleAppointment);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router;
