const Invoice = require('../models/Invoice');
const { deriveInvoicePaymentStatus } = require('./payment');

// Pure: what DP amount should be applied to the invoice given the appointment's
// downPayment state. Refunds reduce the applied DP; `paid` applies the full
// amount; everything else contributes 0.
const computeAppliedDp = (appointment) => {
  const dpAmount = Math.max(0, Number(appointment.downPayment?.amount) || 0);
  const refundedAmount = Math.max(
    0,
    Number(appointment.downPayment?.refundedAmount) || 0
  );
  if (appointment.downPayment?.status === 'paid') return dpAmount;
  if (appointment.downPayment?.status === 'partially_refunded') {
    return Math.max(0, dpAmount - refundedAmount);
  }
  return 0;
};

const refreshInvoicePaymentStatus = (invoice) => {
  invoice.paymentStatus = deriveInvoicePaymentStatus(invoice.amountPaid, invoice.total);
  if (invoice.paymentStatus === 'paid') {
    invoice.paidAt = invoice.paidAt || new Date();
  } else {
    invoice.paidAt = undefined;
  }
};

const syncDownPaymentToInvoice = async (appointment) => {
  const invoice = await Invoice.findOne({ appointmentId: appointment._id });
  if (!invoice) return null;

  const applied = Math.max(0, Number(invoice.downPaymentApplied) || 0);
  const target = computeAppliedDp(appointment);
  const delta = target - applied;

  if (delta !== 0) {
    invoice.amountPaid = Math.max(0, (Number(invoice.amountPaid) || 0) + delta);
    invoice.downPaymentApplied = target;
  }
  if (target > 0 && !invoice.paymentMethod) {
    invoice.paymentMethod = 'Midtrans DP';
  }

  refreshInvoicePaymentStatus(invoice);
  await invoice.save();
  return invoice;
};

module.exports = { refreshInvoicePaymentStatus, syncDownPaymentToInvoice, computeAppliedDp };
