const Invoice = require('../models/Invoice');
const { deriveInvoicePaymentStatus } = require('./payment');

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
  const dpAmount = Math.max(0, Number(appointment.downPayment?.amount) || 0);
  const refundedAmount = Math.max(
    0,
    Number(appointment.downPayment?.refundedAmount) || 0
  );
  const target =
    appointment.downPayment?.status === 'paid'
      ? dpAmount
      : appointment.downPayment?.status === 'partially_refunded'
        ? Math.max(0, dpAmount - refundedAmount)
        : 0;
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

module.exports = { refreshInvoicePaymentStatus, syncDownPaymentToInvoice };
