const asyncHandler = require('express-async-handler');
const DentistLeave = require('../models/DentistLeave');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { toDateKey, dateRangeUtc } = require('../utils/appointmentSchedule');

// Normalise a date string to midnight UTC for a UTC-stored date
const toUtcDay = (input) => {
  const key = toDateKey(input);
  if (!key) return null;
  return new Date(`${key}T00:00:00.000Z`);
};

// @desc  Create a leave block
// @route POST /api/dentist-leaves
// @access Dentist (self) | Admin (any dentistId)
const createLeave = asyncHandler(async (req, res) => {
  const { startDate, endDate, reason, note, dentistId: bodyDentistId } = req.body;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'startDate dan endDate wajib diisi');
  }

  const start = toUtcDay(startDate);
  const end   = toUtcDay(endDate);
  if (!start || !end) throw new ApiError(400, 'Format tanggal tidak valid (gunakan YYYY-MM-DD)');
  if (end < start)    throw new ApiError(400, 'endDate harus sama dengan atau setelah startDate');

  // Resolve dentistId
  let dentistId;
  if (req.user.role === 'admin') {
    if (!bodyDentistId) throw new ApiError(400, 'dentistId wajib diisi untuk admin');
    const dentist = await User.findOne({ _id: bodyDentistId, role: 'dentist', isActive: true });
    if (!dentist) throw new ApiError(404, 'Dokter tidak ditemukan');
    dentistId = dentist._id;
  } else {
    // dentist: always self
    dentistId = req.user._id;
  }

  // Check for overlapping leave
  const overlap = await DentistLeave.findOne({
    dentistId,
    startDate: { $lte: end },
    endDate:   { $gte: start },
  });
  if (overlap) {
    throw new ApiError(409, 'Sudah ada jadwal cuti yang tumpang tindih pada periode tersebut');
  }

  // Check for conflicting appointments (pending / confirmed) — warn but still allow
  const conflicts = await Appointment.find({
    dentistId,
    appointmentDate: { $gte: start, $lte: new Date(end.getTime() + 86399999) },
    status: { $in: ['pending', 'confirmed'] },
  })
    .select('appointmentDate appointmentTime patientId')
    .populate('patientId', 'name');

  const leave = await DentistLeave.create({ dentistId, startDate: start, endDate: end, reason, note });

  res.status(201).json({
    success: true,
    data: leave,
    conflicts: conflicts.length > 0 ? {
      count: conflicts.length,
      message: `Ada ${conflicts.length} appointment aktif pada periode ini. Mohon hubungi admin untuk penjadwalan ulang.`,
      appointments: conflicts.map((a) => ({
        _id: a._id,
        date: a.appointmentDate,
        time: a.appointmentTime,
        patient: a.patientId?.name || '-',
      })),
    } : null,
  });
});

// @desc  List leaves
// @route GET /api/dentist-leaves
// @access Dentist (own) | Admin (all, optional ?dentistId filter)
const listLeaves = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'dentist') {
    filter.dentistId = req.user._id;
  } else if (req.user.role === 'admin') {
    if (req.query.dentistId) filter.dentistId = req.query.dentistId;
  }

  // Optional date window filter
  if (req.query.from) {
    const from = toUtcDay(req.query.from);
    if (from) filter.endDate = { ...filter.endDate, $gte: from };
  }
  if (req.query.to) {
    const to = toUtcDay(req.query.to);
    if (to) filter.startDate = { ...filter.startDate, $lte: to };
  }

  const leaves = await DentistLeave.find(filter)
    .populate('dentistId', 'name email avatar')
    .sort({ startDate: 1 });

  res.json({ success: true, count: leaves.length, data: leaves });
});

// @desc  Delete (cancel) a leave
// @route DELETE /api/dentist-leaves/:id
// @access Dentist (own, only future) | Admin (any)
const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await DentistLeave.findById(req.params.id);
  if (!leave) throw new ApiError(404, 'Jadwal cuti tidak ditemukan');

  if (req.user.role === 'dentist') {
    if (leave.dentistId.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Anda tidak memiliki akses untuk menghapus jadwal cuti ini');
    }
    const today = toUtcDay(new Date().toISOString());
    if (leave.startDate < today) {
      throw new ApiError(400, 'Cuti yang sudah dimulai atau selesai tidak dapat dibatalkan');
    }
  }

  await leave.deleteOne();
  res.json({ success: true, message: 'Jadwal cuti dibatalkan' });
});

// @desc  Check if a dentist is on leave for a specific date (public)
// @route GET /api/dentist-leaves/check?dentistId=X&date=YYYY-MM-DD
// @access Public
const checkLeave = asyncHandler(async (req, res) => {
  const { dentistId, date } = req.query;
  if (!dentistId || !date) {
    throw new ApiError(400, 'dentistId dan date wajib diisi');
  }

  const day = toUtcDay(date);
  if (!day) throw new ApiError(400, 'Format tanggal tidak valid');

  const leave = await DentistLeave.findOne({
    dentistId,
    startDate: { $lte: day },
    endDate:   { $gte: day },
  }).select('reason startDate endDate');

  res.json({
    success: true,
    data: {
      onLeave: !!leave,
      leave: leave || null,
    },
  });
});

module.exports = { createLeave, listLeaves, deleteLeave, checkLeave };
