const mongoose = require('mongoose');

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

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
  },
  { timestamps: true }
);

appointmentSchema.index({ dentistId: 1, appointmentDate: 1, appointmentTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
module.exports.APPOINTMENT_STATUSES = APPOINTMENT_STATUSES;
