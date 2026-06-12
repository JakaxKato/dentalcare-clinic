const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// FDI World Dental notation: adult teeth 11-18, 21-28, 31-38, 41-48
const TOOTH_CONDITIONS = [
  'healthy',
  'caries',
  'filled',
  'missing',
  'root_canal',
  'crown',
  'extraction_planned',
  'fractured',
  'implant',
  'sealant',
];

const toothSchema = new mongoose.Schema(
  {
    fdi: { type: String, required: true },
    conditions: { type: [String], default: [] },
    surfaces: {
      mesial: { type: String, default: '' },
      distal: { type: String, default: '' },
      buccal: { type: String, default: '' },
      lingual: { type: String, default: '' },
      occlusal: { type: String, default: '' },
    },
    notes: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dentistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    appointmentDate: { type: Date, required: true, index: true },
    appointmentTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: 'pending', index: true },
    complaint: { type: String, default: '', trim: true },
    diagnosis: { type: String, default: '', trim: true },
    treatmentNotes: { type: String, default: '', trim: true },
    recommendation: { type: String, default: '', trim: true },
    odontogram: { type: [toothSchema], default: [] },
    reminderSentAt: { type: Date, default: null },
    reminderLastAttemptAt: { type: Date, default: null },
    reminderError: { type: String, default: '' },
    downPayment: {
      amount: { type: Number, default: 0, min: 0 },
      status: {
        type: String,
        enum: [
          'unpaid',
          'pending',
          'paid',
          'failed',
          'expired',
          'partially_refunded',
          'refunded',
        ],
        default: 'unpaid',
      },
      provider: { type: String, default: 'midtrans' },
      transactionId: { type: String, default: '' },
      orderId: { type: String, default: '' },
      paidAt: { type: Date, default: null },
      refundedAmount: { type: Number, default: 0, min: 0 },
      snapToken: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ dentistId: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
module.exports.APPOINTMENT_STATUSES = APPOINTMENT_STATUSES;
module.exports.TOOTH_CONDITIONS = TOOTH_CONDITIONS;
