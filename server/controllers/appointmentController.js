const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};
const endOfDay = (d) => {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
};

// @desc    Create appointment (patient)
// @route   POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const { dentistId, serviceId, appointmentDate, appointmentTime, complaint } = req.body;

  const dentist = await User.findOne({ _id: dentistId, role: 'dentist', isActive: true });
  if (!dentist) throw new ApiError(404, 'Dentist not found or inactive');

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) throw new ApiError(404, 'Service not found or inactive');

  const date = new Date(appointmentDate);
  const conflict = await Appointment.findOne({
    dentistId,
    appointmentDate: { $gte: startOfDay(date), $lte: endOfDay(date) },
    appointmentTime,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) {
    throw new ApiError(409, 'Selected time slot is not available for this dentist');
  }

  const appt = await Appointment.create({
    patientId: req.user._id,
    dentistId,
    serviceId,
    appointmentDate: date,
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
    const d = new Date(req.query.date);
    filter.appointmentDate = { $gte: startOfDay(d), $lte: endOfDay(d) };
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

  const date = new Date(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) throw new ApiError(400, 'New date cannot be in the past');

  const conflict = await Appointment.findOne({
    _id: { $ne: appt._id },
    dentistId: appt.dentistId,
    appointmentDate: { $gte: startOfDay(date), $lte: endOfDay(date) },
    appointmentTime,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) throw new ApiError(409, 'Time slot is not available');

  appt.appointmentDate = date;
  appt.appointmentTime = appointmentTime;
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
      appointmentDate: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
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

module.exports = {
  createAppointment,
  listAppointments,
  myAppointments,
  getAppointment,
  updateStatus,
  rescheduleAppointment,
  deleteAppointment,
  stats,
};
