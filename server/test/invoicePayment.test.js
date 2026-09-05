const test = require('node:test');
const assert = require('node:assert/strict');
const { computeAppliedDp } = require('../utils/invoicePayment');

test('paid DP applies full amount', () => {
  const appt = { downPayment: { status: 'paid', amount: 50000, refundedAmount: 0 } };
  assert.equal(computeAppliedDp(appt), 50000);
});

test('pending/unpaid DP applies nothing', () => {
  const appt = { downPayment: { status: 'pending', amount: 50000, refundedAmount: 0 } };
  assert.equal(computeAppliedDp(appt), 0);
});

test('partial refund reduces the applied DP', () => {
  const appt = {
    downPayment: { status: 'partially_refunded', amount: 50000, refundedAmount: 20000 },
  };
  assert.equal(computeAppliedDp(appt), 30000);
});

test('full refund applies nothing', () => {
  const appt = {
    downPayment: { status: 'partially_refunded', amount: 50000, refundedAmount: 50000 },
  };
  assert.equal(computeAppliedDp(appt), 0);
});

test('missing downPayment state is safe', () => {
  assert.equal(computeAppliedDp({}), 0);
  assert.equal(computeAppliedDp({ downPayment: {} }), 0);
});
