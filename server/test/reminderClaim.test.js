const test = require('node:test');
const assert = require('node:assert/strict');

// Inject a mock Appointment model into the require cache BEFORE loading
// reminderJob, so the module's `const Appointment = require(...)` binds to
// our fake. This keeps the test DB-free while still exercising the real
// claim query semantics.
const calls = [];
const mockAppointment = {
  findOneAndUpdate(filter, update, opts) {
    calls.push({ filter, update, opts });
    return {
      populate() {
        return this;
      },
    };
  },
};

const modelPath = require.resolve('../models/Appointment');
const original = require.cache[modelPath];
require.cache[modelPath] = {
  id: modelPath,
  filename: modelPath,
  loaded: true,
  exports: mockAppointment,
};

const { claimAppointment } = require('../utils/reminderJob');

test('claimAppointment only targets unclaimed or expired appointments', async () => {
  const result = await claimAppointment({ start: '2026-06-13T17:00:00.000Z', end: '2026-06-14T16:59:59.999Z' });

  assert.ok(result, 'claim returns the populated appointment (mocked)');
  assert.equal(calls.length, 1);

  const filter = calls[0].filter;
  assert.deepEqual(filter.reminderSentAt, null);
  // Mongoose serializes { status: { $in: [...] } } with a $in wrapper.
  assert.deepEqual(filter.status, { $in: ['confirmed', 'pending'] });
  // Two branches: never claimed, or the claim window already expired.
  assert.ok(
    Array.isArray(filter.$or) &&
      filter.$or.some((c) => c.reminderClaimedUntil === null) &&
      filter.$or.some((c) => c.reminderClaimedUntil && c.reminderClaimedUntil.$lte)
  );
  // The atomic claim writes a future reminderClaimedUntil.
  assert.ok(calls[0].update.$set.reminderClaimedUntil instanceof Date);
});
