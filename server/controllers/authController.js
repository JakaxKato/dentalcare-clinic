const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

// @desc    Register a new patient (default role)
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(400, 'Email already registered');

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: 'patient',
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  user.password = undefined;
  res.json({
    success: true,
    data: {
      user,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, me };
