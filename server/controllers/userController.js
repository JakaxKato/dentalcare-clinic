const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/sanitize');
const { dentistHasPatientRelation } = require('../utils/accessPolicy');

const ROLE_ENUM = ['patient', 'dentist', 'admin'];

// @desc    List users (admin) — supports ?role= and ?search= and pagination
// @route   GET /api/users
const listUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role && ROLE_ENUM.includes(role)) filter.role = role;
  if (typeof search === 'string' && search.trim()) {
    const safe = escapeRegex(search.trim()).slice(0, 80);
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const total = await User.countDocuments(filter);

  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json({ success: true, count: total, page, totalPages: Math.ceil(total / limit), data: users });
});

// @desc    Get user by id (admin or self)
// @route   GET /api/users/:id
const getUser = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  if (req.user.role !== 'admin' && !isSelf) {
    throw new ApiError(403, 'Not authorized to access this user');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

// @desc    Update user (admin or self)
// @route   PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && !isSelf) {
    throw new ApiError(403, 'Not authorized to modify this user');
  }

  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const allowed = ['name', 'phone', 'avatar', 'dateOfBirth', 'gender', 'address'];
  if (isAdmin) {
    allowed.push('role', 'isActive', 'email');
  }
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  if (req.body.password) {
    if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters');
    }
    // Self must prove ownership with currentPassword to mitigate session hijack.
    // Admins resetting another user's password skip this check.
    if (isSelf) {
      const { currentPassword } = req.body;
      if (!currentPassword || !(await user.matchPassword(currentPassword))) {
        throw new ApiError(400, 'Current password is incorrect');
      }
    }
    user.password = req.body.password; // pre-save hashes
  }

  await user.save();
  user.password = undefined;
  res.json({ success: true, data: user });
});

// @desc    Update medical history (admin, dentist, or self)
// @route   PUT /api/users/:id/medical-history
const updateMedicalHistory = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.role === 'admin';
  const hasRelation =
    req.user.role === 'dentist' &&
    (await dentistHasPatientRelation(req.user._id, req.params.id));
  if (!isAdmin && !isSelf && !hasRelation) throw new ApiError(403, 'Not authorized');

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role !== 'patient') throw new ApiError(400, 'Medical history is only for patients');

  const { bloodType, allergies, conditions, currentMedications, notes } = req.body;
  user.medicalHistory = {
    bloodType: bloodType !== undefined ? bloodType : user.medicalHistory.bloodType,
    allergies: allergies !== undefined ? allergies : user.medicalHistory.allergies,
    conditions: conditions !== undefined ? conditions : user.medicalHistory.conditions,
    currentMedications:
      currentMedications !== undefined ? currentMedications : user.medicalHistory.currentMedications,
    notes: notes !== undefined ? notes : user.medicalHistory.notes,
    updatedAt: new Date(),
  };

  await user.save();
  res.json({ success: true, data: user.medicalHistory });
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, 'You cannot delete your own admin account');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { listUsers, getUser, updateUser, updateMedicalHistory, deleteUser };
