const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAvailableSlots,
  getDayCode,
  intervalsOverlap,
  isWithinWorkingHours,
} = require('../utils/appointmentSchedule');

const profile = {
  availableDays: ['Mon'],
  workingHours: { start: '09:00', end: '12:00' },
};

test('buildAvailableSlots respects duration and overlapping appointments', () => {
  const slots = buildAvailableSlots({
    profile,
    date: '2026-06-15',
    duration: 60,
    appointments: [{ appointmentTime: '10:00', serviceId: { duration: 30 } }],
  });

  assert.deepEqual(slots, ['09:00', '10:30', '11:00']);
});

test('buildAvailableSlots returns no slots outside available days', () => {
  assert.deepEqual(
    buildAvailableSlots({
      profile,
      date: '2026-06-16',
      duration: 30,
      appointments: [],
    }),
    []
  );
});

test('working hours include the service duration', () => {
  assert.equal(isWithinWorkingHours(profile, '11:00', 60), true);
  assert.equal(isWithinWorkingHours(profile, '11:30', 60), false);
});

test('interval overlap uses half-open time ranges', () => {
  assert.equal(intervalsOverlap('09:00', 60, '10:00', 30), false);
  assert.equal(intervalsOverlap('09:30', 60, '10:00', 30), true);
  assert.equal(getDayCode('2026-06-15'), 'Mon');
});
