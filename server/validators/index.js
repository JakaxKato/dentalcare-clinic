const ApiError = require('../utils/ApiError');

const isEmail = (s) => typeof s === 'string' && /^\S+@\S+\.\S+$/.test(s);
const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;
const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

const requireFields = (body, fields) => {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }
};

const validateRegister = (req, _res, next) => {
  const { name, email, password } = req.body;
  if (!isNonEmpty(name)) throw new ApiError(400, 'Name is required');
  if (!isEmail(email)) throw new ApiError(400, 'Valid email is required');
  if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  next();
};

const validateLogin = (req, _res, next) => {
  const { email, password } = req.body;
  if (!isEmail(email)) throw new ApiError(400, 'Valid email is required');
  if (!password) throw new ApiError(400, 'Password is required');
  next();
};

const validateAppointment = (req, _res, next) => {
  const { dentistId, serviceId, appointmentDate, appointmentTime } = req.body;
  requireFields(req.body, ['dentistId', 'serviceId', 'appointmentDate', 'appointmentTime']);
  if (!isTime(appointmentTime)) throw new ApiError(400, 'appointmentTime must be in HH:MM 24h format');
  const date = new Date(appointmentDate);
  if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid appointmentDate');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) throw new ApiError(400, 'Appointment date cannot be in the past');
  void dentistId; void serviceId;
  next();
};

const validateService = (req, _res, next) => {
  requireFields(req.body, ['title', 'description']);
  next();
};

const validateArticle = (req, _res, next) => {
  requireFields(req.body, ['title', 'content']);
  next();
};

const validateTestimonial = (req, _res, next) => {
  const { patientName, rating, message } = req.body;
  if (!isNonEmpty(patientName)) throw new ApiError(400, 'patientName is required');
  if (!isNonEmpty(message)) throw new ApiError(400, 'message is required');
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new ApiError(400, 'rating must be an integer 1-5');
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointment,
  validateService,
  validateArticle,
  validateTestimonial,
};
