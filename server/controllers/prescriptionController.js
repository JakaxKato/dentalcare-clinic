const asyncHandler = require('express-async-handler');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const ApiError = require('../utils/ApiError');

const idOf = (value) => (value?._id || value).toString();

const canViewPrescription = (req, prescription) =>
  req.user.role === 'admin' ||
  idOf(prescription.patientId) === req.user._id.toString() ||
  (req.user.role === 'dentist' &&
    idOf(prescription.dentistId) === req.user._id.toString());

// @desc    Create prescription (admin or assigned dentist)
// @route   POST /api/prescriptions
const createPrescription = asyncHandler(async (req, res) => {
  const { appointmentId, items, generalNotes } = req.body;
  if (!appointmentId) throw new ApiError(400, 'appointmentId is required');
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one prescription item is required');
  }

  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isAdmin = req.user.role === 'admin';
  const isDentist =
    req.user.role === 'dentist' && appt.dentistId.toString() === req.user._id.toString();
  if (!isAdmin && !isDentist) throw new ApiError(403, 'Not authorized');

  const presc = await Prescription.create({
    appointmentId,
    patientId: appt.patientId,
    dentistId: appt.dentistId,
    items,
    generalNotes: generalNotes || '',
  });

  res.status(201).json({ success: true, data: presc });
});

// @desc    List prescriptions (filtered by role, with pagination)
// @route   GET /api/prescriptions?patientId=&appointmentId=
const listPrescriptions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.appointmentId) filter.appointmentId = req.query.appointmentId;

  if (req.user.role === 'patient') {
    filter.patientId = req.user._id;
  } else if (req.user.role === 'dentist') {
    if (req.query.patientId) filter.patientId = req.query.patientId;
    filter.dentistId = req.user._id;
  } else {
    if (req.query.patientId) filter.patientId = req.query.patientId;
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const total = await Prescription.countDocuments(filter);

  const list = await Prescription.find(filter)
    .populate('patientId', 'name email phone')
    .populate('dentistId', 'name email')
    .populate({ path: 'appointmentId', select: 'appointmentDate appointmentTime serviceId', populate: { path: 'serviceId', select: 'title' } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ success: true, count: total, page, totalPages: Math.ceil(total / limit), data: list });
});

// @desc    Get prescription by id
// @route   GET /api/prescriptions/:id
const getPrescription = asyncHandler(async (req, res) => {
  const presc = await Prescription.findById(req.params.id)
    .populate('patientId', 'name email phone address')
    .populate('dentistId', 'name email')
    .populate({ path: 'appointmentId', select: 'appointmentDate appointmentTime serviceId diagnosis', populate: { path: 'serviceId', select: 'title' } });
  if (!presc) throw new ApiError(404, 'Prescription not found');

  if (!canViewPrescription(req, presc)) {
    throw new ApiError(403, 'Not authorized');
  }
  res.json({ success: true, data: presc });
});

// @desc    Update prescription (admin or issuing dentist)
// @route   PUT /api/prescriptions/:id
const updatePrescription = asyncHandler(async (req, res) => {
  const presc = await Prescription.findById(req.params.id);
  if (!presc) throw new ApiError(404, 'Prescription not found');

  const isAdmin = req.user.role === 'admin';
  const isDentist =
    req.user.role === 'dentist' && presc.dentistId.toString() === req.user._id.toString();
  if (!isAdmin && !isDentist) throw new ApiError(403, 'Not authorized');

  if (Array.isArray(req.body.items)) presc.items = req.body.items;
  if (req.body.generalNotes !== undefined) presc.generalNotes = req.body.generalNotes;
  await presc.save();

  res.json({ success: true, data: presc });
});

// @desc    Delete prescription (admin)
// @route   DELETE /api/prescriptions/:id
const deletePrescription = asyncHandler(async (req, res) => {
  const presc = await Prescription.findById(req.params.id);
  if (!presc) throw new ApiError(404, 'Prescription not found');
  await presc.deleteOne();
  res.json({ success: true, message: 'Prescription deleted' });
});

module.exports = {
  createPrescription,
  listPrescriptions,
  getPrescription,
  updatePrescription,
  deletePrescription,
};
