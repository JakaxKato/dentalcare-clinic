const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendWhatsApp } = require('./whatsapp');
const { sendMail } = require('./mailer');
const { getDateKeyInTimeZone } = require('./appointmentSchedule');

const TIME_ZONE = 'Asia/Jakarta';
const CLINIC_NAME = process.env.CLINIC_NAME || 'DentalCare Clinic';
const CLINIC_PHONE = process.env.CLINIC_PHONE_DISPLAY || '';
let jobRunning = false;

const formatTanggal = (date) =>
  new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildMessage = ({ patientName, serviceTitle, dentistName, date, time }) =>
  `Halo ${patientName},\n\n` +
  `Kami ingin mengingatkan jadwal kunjungan Anda di ${CLINIC_NAME} besok:\n\n` +
  `Tanggal: ${formatTanggal(date)}\n` +
  `Pukul: ${time} WIB\n` +
  `Layanan: ${serviceTitle}\n` +
  `Dokter: ${dentistName}\n\n` +
  `Mohon hadir 10 menit sebelum jadwal. Jika ada kendala, hubungi kami${
    CLINIC_PHONE ? ` di ${CLINIC_PHONE}` : ''
  }.\n\nTerima kasih.`;

const addDays = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getTomorrowRange = (now = new Date()) => {
  const todayKey = getDateKeyInTimeZone(now, TIME_ZONE);
  const tomorrowKey = addDays(todayKey, 1);
  const followingKey = addDays(todayKey, 2);
  return {
    dateKey: tomorrowKey,
    start: new Date(`${tomorrowKey}T00:00:00+07:00`),
    end: new Date(new Date(`${followingKey}T00:00:00+07:00`).getTime() - 1),
  };
};

const deliverReminder = async (appt) => {
  const patient = appt.patientId;
  if (!patient) return { delivered: false, previewed: false, error: 'Patient not found' };

  const message = buildMessage({
    patientName: patient.name || 'Pasien',
    serviceTitle: appt.serviceId?.title || 'Pemeriksaan',
    dentistName: appt.dentistId?.name || 'Dokter',
    date: appt.appointmentDate,
    time: appt.appointmentTime,
  });
  let delivered = false;
  let previewed = false;
  const errors = [];

  if (patient.phone) {
    const result = await sendWhatsApp({ to: patient.phone, message });
    delivered = delivered || Boolean(result.sent);
    previewed = previewed || Boolean(result.previewed);
    if (!result.sent && !result.previewed) errors.push(result.error || result.reason || 'WhatsApp failed');
  }

  if (patient.email) {
    try {
      const result = await sendMail({
        to: patient.email,
        subject: `Pengingat Appointment Besok - ${CLINIC_NAME}`,
        text: message,
        html: `<div style="font-family:Arial,sans-serif;white-space:pre-line">${escapeHtml(message)}</div>`,
      });
      delivered = delivered || !result?.previewed;
      previewed = previewed || Boolean(result?.previewed);
    } catch (err) {
      errors.push(`Email: ${err.message}`);
    }
  }

  if (!patient.phone && !patient.email) errors.push('Patient has no phone or email');
  return { delivered, previewed, error: errors.join('; ') };
};

const runReminderJob = async () => {
  if (jobRunning) return { skipped: true, reason: 'Reminder job is already running' };
  jobRunning = true;

  try {
    const { start, end } = getTomorrowRange();
    const appts = await Appointment.find({
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ['confirmed', 'pending'] },
      reminderSentAt: null,
    })
      .populate('patientId', 'name phone email')
      .populate('dentistId', 'name')
      .populate('serviceId', 'title');

    const results = { total: appts.length, sent: 0, previewed: 0, failed: 0 };
    for (const appt of appts) {
      try {
        const delivery = await deliverReminder(appt);
        appt.reminderLastAttemptAt = new Date();
        appt.reminderError = delivery.delivered ? '' : delivery.error || 'No delivery provider configured';
        if (delivery.delivered) {
          appt.reminderSentAt = new Date();
          results.sent += 1;
        } else if (delivery.previewed) {
          results.previewed += 1;
        } else {
          results.failed += 1;
        }
        await appt.save();
      } catch (err) {
        results.failed += 1;
        appt.reminderLastAttemptAt = new Date();
        appt.reminderError = err.message;
        await appt.save().catch(() => {});
        console.error('[reminder] appointment error:', err.message);
      }
    }

    console.log(
      `[reminder] ${new Date().toISOString()} - processed ${results.total} appointment(s) ` +
        `| sent=${results.sent} previewed=${results.previewed} failed=${results.failed}`
    );
    return results;
  } finally {
    jobRunning = false;
  }
};

const startReminderScheduler = () => {
  const schedule = process.env.REMINDER_CRON || '0 9 * * *';
  if (!cron.validate(schedule)) {
    throw new Error(`Invalid REMINDER_CRON expression: ${schedule}`);
  }
  cron.schedule(
    schedule,
    () => {
      runReminderJob().catch((err) => console.error('[reminder] job error:', err.message));
    },
    { timezone: TIME_ZONE }
  );
  console.log(`[reminder] scheduler armed - cron "${schedule}" (${TIME_ZONE})`);
};

module.exports = {
  buildMessage,
  getTomorrowRange,
  deliverReminder,
  runReminderJob,
  startReminderScheduler,
};
