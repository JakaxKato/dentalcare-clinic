const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DentistProfile = require('../models/DentistProfile');
const ApiError = require('../utils/ApiError');

// @desc    Public list of active dentists with profile
// @route   GET /api/dentists
const listDentists = asyncHandler(async (req, res) => {
  const dentists = await User.find({ role: 'dentist', isActive: true }).sort({ createdAt: -1 });
  const profiles = await DentistProfile.find({ userId: { $in: dentists.map((d) => d._id) } });
  const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));
  const data = dentists.map((u) => ({
    user: u,
    profile: profileMap.get(u._id.toString()) || null,
  }));
  res.json({ success: true, count: data.length, data });
});

// @desc    Get single dentist (with profile)
// @route   GET /api/dentists/:id
const getDentist = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'dentist' });
  if (!user) throw new ApiError(404, 'Dentist not found');
  const profile = await DentistProfile.findOne({ userId: user._id });
  res.json({ success: true, data: { user, profile } });
});

// @desc    Create dentist (admin) — creates User(role=dentist) + DentistProfile
// @route   POST /api/dentists
const createDentist = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone, avatar,
    specialization, experienceYears, education, bio,
    availableDays, workingHours, consultationFee,
  } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email, and password are required');
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(400, 'Email already registered');

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    avatar,
    role: 'dentist',
  });

  const profile = await DentistProfile.create({
    userId: user._id,
    specialization,
    experienceYears,
    education,
    bio,
    availableDays,
    workingHours,
    consultationFee,
  });

  res.status(201).json({ success: true, data: { user, profile } });
});

// @desc    Update dentist (admin) — updates User and/or DentistProfile
// @route   PUT /api/dentists/:id
const updateDentist = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'dentist' });
  if (!user) throw new ApiError(404, 'Dentist not found');

  const userFields = ['name', 'phone', 'avatar', 'isActive', 'email'];
  for (const key of userFields) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  if (req.body.password) user.password = req.body.password;
  await user.save();

  let profile = await DentistProfile.findOne({ userId: user._id });
  if (!profile) {
    profile = await DentistProfile.create({ userId: user._id });
  }
  const profileFields = [
    'specialization', 'experienceYears', 'education', 'bio',
    'availableDays', 'workingHours', 'consultationFee',
  ];
  for (const key of profileFields) {
    if (req.body[key] !== undefined) profile[key] = req.body[key];
  }
  await profile.save();

  res.json({ success: true, data: { user, profile } });
});

// @desc    Delete dentist (admin) — removes user and profile
// @route   DELETE /api/dentists/:id
const deleteDentist = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'dentist' });
  if (!user) throw new ApiError(404, 'Dentist not found');
  await DentistProfile.deleteOne({ userId: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'Dentist deleted' });
});

module.exports = { listDentists, getDentist, createDentist, updateDentist, deleteDentist };
