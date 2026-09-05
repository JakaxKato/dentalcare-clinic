const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectTestDB, dropTestDB, disconnectTestDB } = require('./testHelpers');
const { createMidtransSignature } = require('../utils/payment');
const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

let server;
let baseUrl;
let dbReady = false;
const SERVER_KEY = 'test-server-key-1234567890';

test.before(async () => {
  process.env.MIDTRANS_SERVER_KEY = SERVER_KEY;
  process.env.MIDTRANS_CLIENT_KEY = 'test-client-key';
  try {
    await connectTestDB();
    dbReady = true;
  } catch {
    dbReady = false;
    return;
  }
  const app = require('../server');
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectTestDB();
});

test.beforeEach(async () => {
  if (!dbReady) return;
  await dropTestDB();
});

// Helper: seed a patient, dentist, service, and a pending appointment with an
// order id, matching the shape the webhook expects.
async function seedAppointmentWithDp(orderId) {
  const patient = await User.create({
    name: 'Pasien Webhook',
    email: `patient_${Date.now()}@test.com`,
    password: 'password123',
    role: 'patient',
  });
  const dentist = await User.create({
    name: 'Dokter Webhook',
    email: `dentist_${Date.now()}@test.com`,
    password: 'password123',
    role: 'dentist',
  });
  const service = await Service.create({
    title: 'Pemeriksaan',
    description: 'Test service',
    priceRange: { min: 100000, max: 200000 },
    duration: 30,
  });
  const appointment = await Appointment.create({
    patientId: patient._id,
    dentistId: dentist._id,
    serviceId: service._id,
    appointmentDate: new Date('2026-07-01T09:00:00.000Z'),
    appointmentTime: '09:00',
    status: 'confirmed',
    downPayment: {
      amount: 30000,
      status: 'pending',
      orderId,
      provider: 'midtrans',
    },
  });
  return appointment;
}

function buildNotification(appt, overrides = {}) {
  const payload = {
    order_id: appt.downPayment.orderId,
    status_code: '200',
    gross_amount: String(appt.downPayment.amount),
    transaction_status: 'settlement',
    fraud_status: 'accept',
    transaction_id: 'Tx-' + Date.now(),
    signature_key: '',
  };
  payload.signature_key = createMidtransSignature({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    serverKey: SERVER_KEY,
  });
  // Keep the valid signature unless a test explicitly overrides it (e.g. to
  // simulate a tampered notification).
  return { ...payload, ...overrides };
}

test('webhook marks a settlement as paid', { skip: !dbReady }, async () => {
  const appt = await seedAppointmentWithDp(`DP-${Date.now()}`);
  const payload = buildNotification(appt);

  const res = await fetch(`${baseUrl}/api/payments/notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);

  const updated = await Appointment.findById(appt._id);
  assert.equal(updated.downPayment.status, 'paid');
  assert.ok(updated.downPayment.paidAt);
});

test('webhook rejects an invalid signature', { skip: !dbReady }, async () => {
  const appt = await seedAppointmentWithDp(`DP-${Date.now()}-bad`);
  const payload = buildNotification(appt, { signature_key: 'invalid' });

  const res = await fetch(`${baseUrl}/api/payments/notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 401);
});

test('webhook rejects an unknown order id', { skip: !dbReady }, async () => {
  const payload = buildNotification(
    { downPayment: { orderId: `DP-unknown-${Date.now()}`, amount: 30000 } },
    { status_code: '200' }
  );
  // Recompute signature for the unknown order.
  payload.signature_key = createMidtransSignature({
    orderId: payload.order_id,
    statusCode: '200',
    grossAmount: '30000',
    serverKey: SERVER_KEY,
  });

  const res = await fetch(`${baseUrl}/api/payments/notification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 404);
});
