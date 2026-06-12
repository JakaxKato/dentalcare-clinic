const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendMail } = require('../utils/mailer');
const ApiError = require('../utils/ApiError');

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

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
      user: user.toJSON(),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Email is required');

  const genericResponse = {
    success: true,
    message: 'If the email is registered, a reset link has been sent.',
  };

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordTokenHash = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const clientBase = (process.env.CLIENT_URL || '').split(',')[0].trim() || 'http://localhost:5173';
  const resetUrl = `${clientBase}/reset-password/${rawToken}`;

  await sendMail({
    to: user.email,
    subject: 'Reset your DentalCare password',
    text: `You requested a password reset.\n\nReset link (valid 30 minutes): ${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `<p>You requested a password reset.</p>
           <p><a href="${resetUrl}">Click here to reset (valid 30 minutes)</a></p>
           <p>If you did not request this, ignore this email.</p>`,
  });

  res.json(genericResponse);
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordTokenHash +resetPasswordExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password has been reset. You can now log in.' });
});

module.exports = { register, login, me, forgotPassword, resetPassword };
