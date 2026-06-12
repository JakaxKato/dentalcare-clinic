const crypto = require('crypto');

const computeDp = (priceRange, percent = 30, minimum = 25000) => {
  const base = Math.max(0, Number(priceRange?.min) || 0);
  const calculated = Math.ceil((base * Number(percent || 0)) / 100);
  return Math.max(calculated, Math.max(0, Number(minimum) || 0));
};

const createMidtransSignature = ({
  orderId,
  statusCode,
  grossAmount,
  serverKey,
}) =>
  crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

const hasValidSignature = (payload, serverKey) => {
  if (!serverKey || !payload.signature_key) return false;
  const expected = createMidtransSignature({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    serverKey,
  });
  const supplied = String(payload.signature_key);
  if (supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
};

const mapMidtransStatus = ({ transaction_status: status, fraud_status: fraudStatus }) => {
  if (status === 'capture' || status === 'settlement') {
    return fraudStatus === 'challenge' ? 'pending' : 'paid';
  }
  if (status === 'pending') return 'pending';
  if (['deny', 'cancel', 'failure'].includes(status)) return 'failed';
  if (status === 'expire') return 'expired';
  if (status === 'partial_refund') return 'partially_refunded';
  if (status === 'refund') return 'refunded';
  return null;
};

const deriveInvoicePaymentStatus = (amountPaid, total) => {
  const paid = Math.max(0, Number(amountPaid) || 0);
  const due = Math.max(0, Number(total) || 0);
  if (due > 0 && paid >= due) return 'paid';
  if (paid > 0) return 'partial';
  return 'unpaid';
};

module.exports = {
  computeDp,
  createMidtransSignature,
  hasValidSignature,
  mapMidtransStatus,
  deriveInvoicePaymentStatus,
};
