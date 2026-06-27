const mongoose = require('mongoose');

const dentistLeaveSchema = new mongoose.Schema(
  {
    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    reason: {
      type: String,
      enum: ['Cuti', 'Sakit', 'Seminar/Pelatihan', 'Urusan Keluarga', 'Lainnya'],
      default: 'Cuti',
    },
    note: { type: String, default: '', trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

dentistLeaveSchema.index({ dentistId: 1, startDate: 1 });
dentistLeaveSchema.index({ startDate: 1, endDate: 1 });

dentistLeaveSchema.pre('validate', function (next) {
  if (this.endDate < this.startDate) {
    const err = new Error('endDate harus sama dengan atau setelah startDate');
    return next(err);
  }
  next();
});

module.exports = mongoose.model('DentistLeave', dentistLeaveSchema);
