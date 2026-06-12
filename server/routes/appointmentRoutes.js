const express = require('express');
const {
  createAppointment, listAppointments, myAppointments, getAppointment,
  updateStatus, rescheduleAppointment, deleteAppointment, stats,
  updateOdontogram, getPatientOdontogram, triggerReminderJob, getAvailability,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { validateAppointment } = require('../validators');

const router = express.Router();

router.get('/availability', getAvailability);
router.post('/', protect, authorize('patient', 'admin'), validateAppointment, createAppointment);
router.get('/', protect, authorize('admin', 'dentist'), listAppointments);
router.get('/stats', protect, authorize('admin'), stats);
router.post('/trigger-reminders', protect, authorize('admin'), triggerReminderJob);
router.get('/my-appointments', protect, authorize('patient'), myAppointments);
router.get('/patient/:patientId/odontogram', protect, getPatientOdontogram);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, updateStatus);
router.put('/:id/reschedule', protect, rescheduleAppointment);
router.put('/:id/odontogram', protect, updateOdontogram);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router;
