const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const DentistProfile = require('../models/DentistProfile');
const ApiError = require('../utils/ApiError');
const { runReminderJob } = require('../utils/reminderJob');
const {
  toDateKey,
  dateRangeUtc,
  getDateKeyInTimeZone,
  getSchedule,
  isWorkingDay,
  isWithinWorkingHours,
  intervalsOverlap,
  buildAvailableSlots,
} = require('../utils/appointmentSchedule');

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const loadScheduleContext = async ({
  dentistId,
  serviceId,
  appointmentDate,
  excludeAppointmentId,
}) => {
  const range = dateRangeUtc(appointmentDate);
  if (!range) throw new ApiError(400, 'Invalid appointmentDate');

  const [dentist, profile, service] = await Promise.all([
    User.findOne({ _id: dentistId, role: 'dentist', isActive: true }),
    DentistProfile.findOne({ userId: dentistId }),
    Service.findOne({ _id: serviceId, isActive: true }),
  ]);
  if (!dentist) throw new ApiError(404, 'Dentist not found or inactive');
  if (!service) throw new ApiError(404, 'Service not found or inactive');

  const filter = {
    dentistId,
    appointmentDate: { $gte: range.start, $lte: range.end },
    status: { $in: ['pending', 'confirmed'] },
  };
  if (excludeAppointmentId) filter._id = { $ne: excludeAppointmentId };

  const appointments = await Appointment.find(filter)
    .select('appointmentTime serviceId')
    .populate('serviceId', 'duration');

  return { dentist, profile, service, appointments, range };
};

const assertSlotAvailable = ({ profile, service, appointments, date, time }) => {
  if (!isWorkingDay(profile, date)) {
    throw new ApiError(400, 'Dentist is not available on the selected day');
  }
  if (!isWithinWorkingHours(profile, time, service.duration)) {
    throw new ApiError(400, 'Selected time is outside the dentist working hours');
  }
  const conflict = appointments.some((appt) =>
    intervalsOverlap(
      time,
      service.duration,
      appt.appointmentTime,
      appt.serviceId?.duration || 30
    )
  );
  if (conflict) {
    throw new ApiError(409, 'Selected time slot is not available for this dentist');
  }
};

// @desc    Public available slots for a dentist, date, and service
// @route   GET /api/appointments/availability
const getAvailability = asyncHandler(async (req, res) => {
  const { dentistId, serviceId, date, excludeAppointmentId } = req.query;
  if (!dentistId || !serviceId || !date) {
    throw new ApiError(400, 'dentistId, serviceId, and date are required');
  }
  if (toDateKey(date) < getDateKeyInTimeZone()) {
    throw new ApiError(400, 'Appointment date cannot be in the past');
  }

  const context = await loadScheduleContext({
    dentistId,
    serviceId,
    appointmentDate: date,
    excludeAppointmentId,
  });
  const slots = buildAvailableSlots({
    profile: context.profile,
    date,
    duration: context.service.duration,
    appointments: context.appointments,
  });

  res.json({
    success: true,
    data: {
      date: context.range.key,
      slots,
      duration: context.service.duration,
      schedule: getSchedule(context.profile),
    },
  });
});

// @desc    Create appointment (patient)
// @route   POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const {
    dentistId,
    serviceId,
    appointmentDate,
    appointmentTime,
    complaint,
    patientId: requestedPatientId,
  } = req.body;
  const patientId = req.user.role === 'admin' ? requestedPatientId : req.user._id;
  if (!patientId) throw new ApiError(400, 'patientId is required when admin creates an appointment');
  if (toDateKey(appointmentDate) < getDateKeyInTimeZone()) {
    throw new ApiError(400, 'Appointment date cannot be in the past');
  }
  if (req.user.role === 'admin') {
    const patient = await User.findOne({ _id: patientId, role: 'patient', isActive: true });
    if (!patient) throw new ApiError(404, 'Patient not found or inactive');
  }

  const context = await loadScheduleContext({
    dentistId,
    serviceId,
    appointmentDate,
  });
  assertSlotAvailable({
    profile: context.profile,
    service: context.service,
    appointments: context.appointments,
    date: context.range.key,
    time: appointmentTime,
  });

  const appt = await Appointment.create({
    patientId,
    dentistId,
    serviceId,
    appointmentDate: context.range.start,
    appointmentTime,
    complaint,
    status: 'pending',
  });

  res.status(201).json({ success: true, data: appt });
});

// @desc    List appointments (admin: all; dentist: assigned only)
// @route   GET /api/appointments
const listAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'dentist') filter.dentistId = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const range = dateRangeUtc(req.query.date);
    if (!range) throw new ApiError(400, 'Invalid date filter');
    filter.appointmentDate = { $gte: range.start, $lte: range.end };
  }
  if (req.query.dentistId && req.user.role === 'admin') filter.dentistId = req.query.dentistId;

  const appts = await Appointment.find(filter)
    .populate('patientId', 'name email phone avatar')
    .populate('dentistId', 'name email avatar')
    .populate('serviceId', 'title slug duration priceRange')
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  res.json({ success: true, count: appts.length, data: appts });
});

// @desc    Patient's own appointments
// @route   GET /api/appointments/my-appointments
const myAppointments = asyncHandler(async (req, res) => {
  const appts = await Appointment.find({ patientId: req.user._id })
    .populate('dentistId', 'name email avatar')
    .populate('serviceId', 'title slug duration priceRange')
    .sort({ appointmentDate: -1, appointmentTime: -1 });
  res.json({ success: true, count: appts.length, data: appts });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
const getAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('patientId', 'name email phone avatar')
    .populate('dentistId', 'name email avatar')
    .populate('serviceId', 'title slug duration priceRange');
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isOwner =
    req.user.role === 'admin' ||
    appt.patientId._id.toString() === req.user._id.toString() ||
    appt.dentistId._id.toString() === req.user._id.toString();
  if (!isOwner) throw new ApiError(403, 'Not authorized to view this appointment');

  res.json({ success: true, data: appt });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const { status, diagnosis, treatmentNotes, recommendation } = req.body;
  if (!status) throw new ApiError(400, 'status is required');

  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const allowedNext = ALLOWED_TRANSITIONS[appt.status] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${appt.status} to ${status}`);
  }

  // Authorization rules per transition
  const isAdmin = req.user.role === 'admin';
  const isDentist = req.user.role === 'dentist' && appt.dentistId.toString() === req.user._id.toString();
  const isPatient = req.user.role === 'patient' && appt.patientId.toString() === req.user._id.toString();

  if (status === 'confirmed' && !isAdmin && !isDentist) {
    throw new ApiError(403, 'Only admin or assigned dentist can confirm appointments');
  }
  if (status === 'completed' && !isAdmin && !isDentist) {
    throw new ApiError(403, 'Only admin or assigned dentist can complete appointments');
  }
  if (status === 'cancelled') {
    if (!isAdmin && !isDentist && !isPatient) {
      throw new ApiError(403, 'Not authorized to cancel this appointment');
    }
    if (isPatient && appt.status !== 'pending') {
      throw new ApiError(400, 'Patients can only cancel pending appointments');
    }
  }

  appt.status = status;
  if (diagnosis !== undefined) appt.diagnosis = diagnosis;
  if (treatmentNotes !== undefined) appt.treatmentNotes = treatmentNotes;
  if (recommendation !== undefined) appt.recommendation = recommendation;

  await appt.save();
  res.json({ success: true, data: appt });
});

// @desc    Reschedule appointment (admin or assigned dentist)
// @route   PUT /api/appointments/:id/reschedule
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { appointmentDate, appointmentTime } = req.body;
  if (!appointmentDate || !appointmentTime) {
    throw new ApiError(400, 'appointmentDate and appointmentTime are required');
  }

  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isAdmin = req.user.role === 'admin';
  const isDentist = req.user.role === 'dentist' && appt.dentistId.toString() === req.user._id.toString();
  if (!isAdmin && !isDentist) {
    throw new ApiError(403, 'Only admin or the assigned dentist can reschedule');
  }
  if (!['pending', 'confirmed'].includes(appt.status)) {
    throw new ApiError(400, 'Only pending or confirmed appointments can be rescheduled');
  }

  if (toDateKey(appointmentDate) < getDateKeyInTimeZone()) {
    throw new ApiError(400, 'New date cannot be in the past');
  }
  const context = await loadScheduleContext({
    dentistId: appt.dentistId,
    serviceId: appt.serviceId,
    appointmentDate,
    excludeAppointmentId: appt._id,
  });
  assertSlotAvailable({
    profile: context.profile,
    service: context.service,
    appointments: context.appointments,
    date: context.range.key,
    time: appointmentTime,
  });

  appt.appointmentDate = context.range.start;
  appt.appointmentTime = appointmentTime;
  appt.reminderSentAt = null;
  appt.reminderLastAttemptAt = null;
  appt.reminderError = '';
  await appt.save();

  res.json({ success: true, data: appt });
});

// @desc    Delete appointment (admin)
// @route   DELETE /api/appointments/:id
const deleteAppointment = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');
  await appt.deleteOne();
  res.json({ success: true, message: 'Appointment deleted' });
});

// @desc    Stats for admin dashboard
// @route   GET /api/appointments/stats
const stats = asyncHandler(async (_req, res) => {
  const todayRange = dateRangeUtc(getDateKeyInTimeZone());
  const [
    totalAppointments,
    pending,
    confirmed,
    completed,
    cancelled,
    todayCount,
    newPatientsThisMonth,
    topServices,
    topDentists,
  ] = await Promise.all([
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'confirmed' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Appointment.countDocuments({
      appointmentDate: { $gte: todayRange.start, $lte: todayRange.end },
    }),
    User.countDocuments({
      role: 'patient',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
    Appointment.aggregate([
      { $group: { _id: '$serviceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $project: { _id: 0, serviceId: '$_id', title: '$service.title', count: 1 } },
    ]),
    Appointment.aggregate([
      { $group: { _id: '$dentistId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'dentist' } },
      { $unwind: '$dentist' },
      { $project: { _id: 0, dentistId: '$_id', name: '$dentist.name', count: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalAppointments,
      byStatus: { pending, confirmed, completed, cancelled },
      todayCount,
      newPatientsThisMonth,
      topServices,
      topDentists,
    },
  });
});

// @desc    Update odontogram for an appointment (admin or assigned dentist)
// @route   PUT /api/appointments/:id/odontogram
const updateOdontogram = asyncHandler(async (req, res) => {
  const { odontogram } = req.body;
  if (!Array.isArray(odontogram)) {
    throw new ApiError(400, 'odontogram must be an array');
  }

  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isAdmin = req.user.role === 'admin';
  const isDentist = req.user.role === 'dentist' && appt.dentistId.toString() === req.user._id.toString();
  if (!isAdmin && !isDentist) {
    throw new ApiError(403, 'Only admin or assigned dentist can update odontogram');
  }

  appt.odontogram = odontogram;
  await appt.save();
  res.json({ success: true, data: appt.odontogram });
});

// @desc    Manually trigger the H-1 WhatsApp reminder job (admin)
// @route   POST /api/appointments/trigger-reminders
const triggerReminderJob = asyncHandler(async (_req, res) => {
  const results = await runReminderJob();
  res.json({ success: true, data: results });
});

// @desc    Get patient's latest odontogram (from most recent completed appointment)
// @route   GET /api/appointments/patient/:patientId/odontogram
const getPatientOdontogram = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.patientId;
  const isStaff = req.user.role === 'admin' || req.user.role === 'dentist';
  if (!isSelf && !isStaff) throw new ApiError(403, 'Not authorized');

  const latest = await Appointment.findOne({
    patientId: req.params.patientId,
    odontogram: { $exists: true, $ne: [] },
  })
    .sort({ appointmentDate: -1, appointmentTime: -1 })
    .select('odontogram appointmentDate dentistId')
    .populate('dentistId', 'name');

  res.json({
    success: true,
    data: latest
      ? { odontogram: latest.odontogram, takenAt: latest.appointmentDate, dentist: latest.dentistId }
      : { odontogram: [], takenAt: null, dentist: null },
  });
});

module.exports = {
  createAppointment,
  listAppointments,
  myAppointments,
  getAppointment,
  updateStatus,
  rescheduleAppointment,
  deleteAppointment,
  stats,
  updateOdontogram,
  getPatientOdontogram,
  triggerReminderJob,
  getAvailability,
};
