const mongoose = require('mongoose');

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'refunded', 'cancelled'];

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      index: true,
    },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dentistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    taxRate: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
    amountPaid: { type: Number, min: 0, default: 0 },
    downPaymentApplied: { type: Number, min: 0, default: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid', index: true },
    paymentMethod: { type: String, default: '' },
    paidAt: { type: Date },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

invoiceSchema.statics.generateInvoiceNumber = async function () {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    },
  });
  return `INV-${ym}-${String(count + 1).padStart(4, '0')}`;
};

module.exports = mongoose.model('Invoice', invoiceSchema);
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
