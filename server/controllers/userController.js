const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// @desc    List users (admin) — supports ?role= and ?search=
// @route   GET /api/users
const listUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
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
  if (req.user.role !== 'admin' && !isSelf) {
    throw new ApiError(403, 'Not authorized to modify this user');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  const allowed = ['name', 'phone', 'avatar', 'dateOfBirth', 'gender', 'address'];
  if (req.user.role === 'admin') {
    allowed.push('role', 'isActive', 'email');
  }
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  if (req.body.password) {
    user.password = req.body.password; // pre-save hashes
  }

  await user.save();
  res.json({ success: true, data: user });
});

// @desc    Update medical history (admin, dentist, or self)
// @route   PUT /api/users/:id/medical-history
const updateMedicalHistory = asyncHandler(async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  const canEdit = req.user.role === 'admin' || req.user.role === 'dentist' || isSelf;
  if (!canEdit) throw new ApiError(403, 'Not authorized');

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
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { listUsers, getUser, updateUser, updateMedicalHistory, deleteUser };
