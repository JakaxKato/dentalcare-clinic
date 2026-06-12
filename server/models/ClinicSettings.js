const mongoose = require('mongoose');

// Singleton document: only one ClinicSettings row exists.
const clinicSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: 'main', unique: true },
    clinicName: {
      type: String,
      default: 'Smile Dental',
      required: true,
      trim: true,
      maxlength: 120,
    },
    tagline: {
      type: String,
      default: 'Klinik Gigi Modern Keluarga',
      trim: true,
      maxlength: 200,
    },
    logoUrl: { type: String, default: '', trim: true, maxlength: 500 },
    faviconUrl: { type: String, default: '', trim: true, maxlength: 500 },
    primaryColor: {
      type: String,
      default: '#1782f5',
      trim: true,
      match: /^#([0-9a-fA-F]{3}){1,2}$/,
    },
    accentColor: {
      type: String,
      default: '#14b8a6',
      trim: true,
      match: /^#([0-9a-fA-F]{3}){1,2}$/,
    },
    address: { type: String, default: '', trim: true, maxlength: 500 },
    mapEmbedUrl: { type: String, default: '', trim: true, maxlength: 1000 },
    phone: { type: String, default: '', trim: true, maxlength: 50 },
    email: { type: String, default: '', trim: true, lowercase: true, maxlength: 120 },
    whatsapp: { type: String, default: '', trim: true, maxlength: 50 },
    instagram: { type: String, default: '', trim: true, maxlength: 120 },
    operatingHours: {
      type: String,
      default: 'Senin - Minggu: 09.00 - 20.00',
      trim: true,
      maxlength: 300,
    },
    footerNote: { type: String, default: '', trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

clinicSettingsSchema.statics.getOrCreate = async function getOrCreate() {
  return this.findOneAndUpdate(
    { singletonKey: 'main' },
    { $setOnInsert: { singletonKey: 'main' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('ClinicSettings', clinicSettingsSchema);
