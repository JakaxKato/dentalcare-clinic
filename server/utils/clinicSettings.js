const ApiError = require('./ApiError');

const PUBLIC_FIELDS = [
  'clinicName',
  'tagline',
  'logoUrl',
  'faviconUrl',
  'primaryColor',
  'accentColor',
  'address',
  'mapEmbedUrl',
  'phone',
  'email',
  'whatsapp',
  'instagram',
  'operatingHours',
  'footerNote',
];

const HEX_RE = /^#([0-9a-fA-F]{3}){1,2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeClinicSettings = (body = {}) => {
  const updates = {};

  for (const key of PUBLIC_FIELDS) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'string') {
      throw new ApiError(400, `${key} must be a string`);
    }
    updates[key] = body[key].trim();
  }

  if ('clinicName' in updates && !updates.clinicName) {
    throw new ApiError(400, 'clinicName is required');
  }
  for (const key of ['primaryColor', 'accentColor']) {
    if (key in updates && !HEX_RE.test(updates[key])) {
      throw new ApiError(400, `${key} must be a valid hex color`);
    }
    if (key in updates) updates[key] = updates[key].toLowerCase();
  }
  if (updates.email && !EMAIL_RE.test(updates.email)) {
    throw new ApiError(400, 'email must be valid');
  }
  if ('email' in updates) updates.email = updates.email.toLowerCase();

  return updates;
};

const serializeClinicSettings = (settings) =>
  Object.fromEntries(PUBLIC_FIELDS.map((key) => [key, settings[key] || '']));

module.exports = {
  PUBLIC_FIELDS,
  normalizeClinicSettings,
  serializeClinicSettings,
};
