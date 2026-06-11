const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema(
  {
    drugName: { type: String, required: true, trim: true },
    dosage: { type: String, default: '', trim: true },
    frequency: { type: String, default: '', trim: true },
    duration: { type: String, default: '', trim: true },
    instructions: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dentistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [prescriptionItemSchema], default: [] },
    generalNotes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
