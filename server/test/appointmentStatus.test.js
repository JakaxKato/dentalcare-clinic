const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ALLOWED_TRANSITIONS,
  canTransition,
  getTransitionPermissions,
} = require('../utils/appointmentStatus');

test('allowed transitions follow the state machine', () => {
  assert.equal(canTransition('pending', 'confirmed'), true);
  assert.equal(canTransition('pending', 'cancelled'), true);
  assert.equal(canTransition('confirmed', 'completed'), true);
  assert.equal(canTransition('confirmed', 'cancelled'), true);
  assert.equal(canTransition('completed', 'cancelled'), false);
  assert.equal(canTransition('cancelled', 'confirmed'), false);
  assert.equal(canTransition('pending', 'completed'), false);
});

test('admin/dentist can confirm, complete, cancel, and edit notes', () => {
  const appt = { patientId: 'p1', dentistId: 'd1' };
  const admin = getTransitionPermissions({ role: 'admin', appt, currentUserId: 'a1' });
  assert.equal(admin.canConfirm, true);
  assert.equal(admin.canComplete, true);
  assert.equal(admin.canCancel, true);
  assert.equal(admin.canEditClinicalNotes, true);
});

test('assigned dentist gets all clinical privileges', () => {
  const appt = { patientId: 'p1', dentistId: 'd1' };
  const dent = getTransitionPermissions({ role: 'dentist', appt, currentUserId: 'd1' });
  assert.equal(dent.isAssignedDentist, true);
  assert.equal(dent.canConfirm, true);
  assert.equal(dent.canComplete, true);
  assert.equal(dent.canCancel, true);
  assert.equal(dent.canEditClinicalNotes, true);
});

test('unassigned dentist has no privileges', () => {
  const appt = { patientId: 'p1', dentistId: 'd1' };
  const dent = getTransitionPermissions({ role: 'dentist', appt, currentUserId: 'other' });
  assert.equal(dent.canConfirm, false);
  assert.equal(dent.canComplete, false);
  assert.equal(dent.canCancel, false);
  assert.equal(dent.canEditClinicalNotes, false);
});

test('owning patient can cancel but not confirm/complete/edit notes', () => {
  const appt = { patientId: 'p1', dentistId: 'd1' };
  const patient = getTransitionPermissions({ role: 'patient', appt, currentUserId: 'p1' });
  assert.equal(patient.isOwningPatient, true);
  assert.equal(patient.canCancel, true);
  assert.equal(patient.canConfirm, false);
  assert.equal(patient.canComplete, false);
  assert.equal(patient.canEditClinicalNotes, false);
});

test('ALLOWED_TRANSITIONS stays consistent', () => {
  assert.deepEqual(ALLOWED_TRANSITIONS.pending, ['confirmed', 'cancelled']);
  assert.deepEqual(ALLOWED_TRANSITIONS.completed, []);
});
