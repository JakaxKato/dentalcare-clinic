const asyncHandler = require('express-async-handler');
const ClinicSettings = require('../models/ClinicSettings');
const {
  normalizeClinicSettings,
  serializeClinicSettings,
} = require('../utils/clinicSettings');

const getPublicSettings = asyncHandler(async (_req, res) => {
  const settings = await ClinicSettings.getOrCreate();
  res.json({ success: true, data: serializeClinicSettings(settings) });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await ClinicSettings.getOrCreate();
  Object.assign(settings, normalizeClinicSettings(req.body));
  await settings.save();

  res.json({
    success: true,
    message: 'Pengaturan klinik diperbarui',
    data: serializeClinicSettings(settings),
  });
});

module.exports = { getPublicSettings, updateSettings };
