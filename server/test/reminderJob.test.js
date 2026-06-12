const test = require('node:test');
const assert = require('node:assert/strict');
const { getTomorrowRange } = require('../utils/reminderJob');

test('getTomorrowRange follows the Asia/Jakarta calendar day', () => {
  const range = getTomorrowRange(new Date('2026-06-12T18:00:00.000Z'));

  assert.equal(range.dateKey, '2026-06-14');
  assert.equal(range.start.toISOString(), '2026-06-13T17:00:00.000Z');
  assert.equal(range.end.toISOString(), '2026-06-14T16:59:59.999Z');
});
