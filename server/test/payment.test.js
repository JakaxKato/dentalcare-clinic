const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeDp,
  createMidtransSignature,
  hasValidSignature,
  mapMidtransStatus,
  deriveInvoicePaymentStatus,
} = require('../utils/payment');

test('computeDp uses server percentage and minimum', () => {
  assert.equal(computeDp({ min: 100000 }, 30, 25000), 30000);
  assert.equal(computeDp({ min: 50000 }, 30, 25000), 25000);
});

test('Midtrans signature must be present and valid', () => {
  const payload = {
    order_id: 'DP-123',
    status_code: '200',
    gross_amount: '30000.00',
  };
  payload.signature_key = createMidtransSignature({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    serverKey: 'server-secret',
  });

  assert.equal(hasValidSignature(payload, 'server-secret'), true);
  assert.equal(hasValidSignature({ ...payload, signature_key: '' }, 'server-secret'), false);
  assert.equal(hasValidSignature(payload, 'wrong-secret'), false);
});

test('Midtrans and invoice statuses are derived consistently', () => {
  assert.equal(mapMidtransStatus({ transaction_status: 'settlement' }), 'paid');
  assert.equal(
    mapMidtransStatus({ transaction_status: 'capture', fraud_status: 'challenge' }),
    'pending'
  );
  assert.equal(mapMidtransStatus({ transaction_status: 'expire' }), 'expired');
  assert.equal(
    mapMidtransStatus({ transaction_status: 'partial_refund' }),
    'partially_refunded'
  );
  assert.equal(deriveInvoicePaymentStatus(0, 100000), 'unpaid');
  assert.equal(deriveInvoicePaymentStatus(30000, 100000), 'partial');
  assert.equal(deriveInvoicePaymentStatus(100000, 100000), 'paid');
});
