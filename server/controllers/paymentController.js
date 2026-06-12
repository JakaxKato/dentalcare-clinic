const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const ApiError = require('../utils/ApiError');
const { hasMidtrans, getSnap } = require('../utils/midtrans');
const {
  computeDp,
  hasValidSignature,
  mapMidtransStatus,
} = require('../utils/payment');
const { syncDownPaymentToInvoice } = require('../utils/invoicePayment');

const DEFAULT_DP_PERCENT = Number(process.env.DP_PERCENT || 30);
const MIN_DP_AMOUNT = Number(process.env.DP_MIN_AMOUNT || 25000);
const getDpAmount = (priceRange) =>
  computeDp(priceRange, DEFAULT_DP_PERCENT, MIN_DP_AMOUNT);

// @desc    Create DP Snap token for an appointment (patient)
// @route   POST /api/payments/appointment/:id/dp
const createDpTransaction = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('serviceId', 'title priceRange')
    .populate('patientId', 'name email phone');
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isOwner = appt.patientId._id.toString() === req.user._id.toString();
  if (!isOwner) throw new ApiError(403, 'Not authorized for this appointment');
  if (['paid', 'partially_refunded'].includes(appt.downPayment.status)) {
    throw new ApiError(400, 'DP for this appointment has already been applied');
  }
  if (!['pending', 'confirmed'].includes(appt.status)) {
    throw new ApiError(400, 'DP only allowed for pending/confirmed appointments');
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  if (appt.downPayment.status === 'pending' && appt.downPayment.snapToken) {
    return res.json({
      success: true,
      data: {
        snapToken: appt.downPayment.snapToken,
        orderId: appt.downPayment.orderId,
        amount: appt.downPayment.amount,
        clientKey: process.env.MIDTRANS_CLIENT_KEY || null,
        isProduction,
      },
    });
  }

  const amount = getDpAmount(appt.serviceId?.priceRange);
  const orderId = `DP-${appt._id}-${Date.now()}`;
  const clientOrigin = process.env.CLIENT_URL?.split(',')[0]?.trim();
  const params = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    item_details: [
      {
        id: appt.serviceId._id.toString(),
        price: amount,
        quantity: 1,
        name: `DP - ${appt.serviceId.title}`.slice(0, 50),
      },
    ],
    customer_details: {
      first_name: appt.patientId.name,
      email: appt.patientId.email,
      phone: appt.patientId.phone || '',
    },
  };
  if (clientOrigin) {
    params.callbacks = { finish: `${clientOrigin}/patient/appointments` };
  }

  let snapToken = '';
  let redirectUrl = '';
  if (hasMidtrans()) {
    const tx = await getSnap().createTransaction(params);
    snapToken = tx.token;
    redirectUrl = tx.redirect_url;
  } else {
    console.log('[midtrans] keys not set - returning a development transaction token.');
    snapToken = `DEV-${orderId}`;
  }

  appt.downPayment.amount = amount;
  appt.downPayment.status = 'pending';
  appt.downPayment.orderId = orderId;
  appt.downPayment.snapToken = snapToken;
  appt.downPayment.provider = 'midtrans';
  await appt.save();

  res.json({
    success: true,
    data: {
      snapToken,
      redirectUrl,
      orderId,
      amount,
      clientKey: process.env.MIDTRANS_CLIENT_KEY || null,
      isProduction,
    },
  });
});

// @desc    DEV-only manual confirm
// @route   POST /api/payments/appointment/:id/dp/confirm
const confirmDpDev = asyncHandler(async (req, res) => {
  if (hasMidtrans()) throw new ApiError(400, 'Use Midtrans notification webhook');

  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isOwnerOrAdmin =
    req.user.role === 'admin' || appt.patientId.toString() === req.user._id.toString();
  if (!isOwnerOrAdmin) throw new ApiError(403, 'Not authorized');
  if (!appt.downPayment.amount || appt.downPayment.status !== 'pending') {
    throw new ApiError(400, 'Create a DP transaction before confirming it');
  }

  appt.downPayment.status = 'paid';
  appt.downPayment.paidAt = new Date();
  appt.downPayment.refundedAmount = 0;
  appt.downPayment.transactionId = `DEV-TX-${Date.now()}`;
  await appt.save();
  await syncDownPaymentToInvoice(appt);

  res.json({ success: true, data: appt.downPayment });
});

// @desc    Midtrans webhook notification
// @route   POST /api/payments/notification
const handleNotification = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
    transaction_id,
    refund_amount,
  } = body;
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

  if (!serverKey) {
    return res.status(503).json({ success: false, message: 'Midtrans is not configured' });
  }
  if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status) {
    return res.status(400).json({ success: false, message: 'Incomplete notification payload' });
  }
  if (!hasValidSignature(body, serverKey)) {
    console.warn('[midtrans] invalid signature for', order_id);
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  const appt = await Appointment.findOne({ 'downPayment.orderId': order_id });
  if (!appt) {
    console.warn('[midtrans] notification for unknown order', order_id);
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }
  if (Math.round(Number(gross_amount)) !== Math.round(Number(appt.downPayment.amount))) {
    return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
  }

  const newStatus = mapMidtransStatus({ transaction_status, fraud_status });
  if (!newStatus) return res.json({ success: true, ignored: true });

  appt.downPayment.status = newStatus;
  if (transaction_id) appt.downPayment.transactionId = transaction_id;
  if (newStatus === 'paid' && !appt.downPayment.paidAt) {
    appt.downPayment.paidAt = new Date();
    appt.downPayment.refundedAmount = 0;
  } else if (newStatus === 'partially_refunded') {
    appt.downPayment.refundedAmount = Math.min(
      Number(appt.downPayment.amount) || 0,
      Math.max(0, Number(refund_amount) || 0)
    );
  } else if (newStatus === 'refunded') {
    appt.downPayment.refundedAmount = Number(appt.downPayment.amount) || 0;
  }
  await appt.save();
  await syncDownPaymentToInvoice(appt);

  res.json({ success: true });
});

// @desc    Get DP status for an appointment
// @route   GET /api/payments/appointment/:id/dp
const getDpStatus = asyncHandler(async (req, res) => {
  const appt = await Appointment.findById(req.params.id).populate(
    'serviceId',
    'priceRange title'
  );
  if (!appt) throw new ApiError(404, 'Appointment not found');

  const isAllowed =
    req.user.role === 'admin' ||
    appt.patientId.toString() === req.user._id.toString() ||
    appt.dentistId.toString() === req.user._id.toString();
  if (!isAllowed) throw new ApiError(403, 'Not authorized');

  res.json({
    success: true,
    data: {
      downPayment: appt.downPayment,
      suggestedAmount: getDpAmount(appt.serviceId?.priceRange),
      clientKey: process.env.MIDTRANS_CLIENT_KEY || null,
      midtransEnabled: hasMidtrans(),
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    },
  });
});

module.exports = {
  createDpTransaction,
  confirmDpDev,
  handleNotification,
  getDpStatus,
};
