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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(appointmentDate))) {
    throw new ApiError(400, 'appointmentDate must be in YYYY-MM-DD format');
  }
  const date = new Date(`${appointmentDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid appointmentDate');
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
  // patientName only required when not authenticated (auth path auto-fills from user)
  if (!req.user && !isNonEmpty(patientName)) {
    throw new ApiError(400, 'patientName is required');
  }
  if (!isNonEmpty(message)) throw new ApiError(400, 'message is required');
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new ApiError(400, 'rating must be an integer 1-5');
  next();
};

const validateInvoice = (req, _res, next) => {
  requireFields(req.body, ['appointmentId']);
  if (req.body.items !== undefined) {
    if (!Array.isArray(req.body.items)) throw new ApiError(400, 'items must be an array');
    for (const item of req.body.items) {
      if (!isNonEmpty(item.description)) throw new ApiError(400, 'Each item must have a description');
      if (item.unitPrice !== undefined && (Number(item.unitPrice) < 0 || !Number.isFinite(Number(item.unitPrice)))) {
        throw new ApiError(400, 'unitPrice must be a non-negative number');
      }
    }
  }
  if (req.body.discount !== undefined) {
    const d = Number(req.body.discount);
    if (!Number.isFinite(d) || d < 0) throw new ApiError(400, 'discount must be a non-negative number');
  }
  if (req.body.taxRate !== undefined) {
    const t = Number(req.body.taxRate);
    if (!Number.isFinite(t) || t < 0 || t > 100) throw new ApiError(400, 'taxRate must be between 0 and 100');
  }
  next();
};

const validatePrescription = (req, _res, next) => {
  requireFields(req.body, ['appointmentId']);
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    throw new ApiError(400, 'At least one prescription item is required');
  }
  for (const item of req.body.items) {
    if (!isNonEmpty(item.drugName)) throw new ApiError(400, 'Each item must have a drugName');
  }
  next();
};

const validateUserUpdate = (req, _res, next) => {
  if (req.body.email !== undefined && !isEmail(req.body.email)) {
    throw new ApiError(400, 'Valid email is required');
  }
  if (req.body.name !== undefined && !isNonEmpty(req.body.name)) {
    throw new ApiError(400, 'Name cannot be empty');
  }
  if (req.body.password !== undefined && req.body.password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAppointment,
  validateService,
  validateArticle,
  validateTestimonial,
  validateInvoice,
  validatePrescription,
  validateUserUpdate,
};
