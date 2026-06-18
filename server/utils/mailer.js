const nodemailer = require('nodemailer');
const { hasSmtp } = require('../config/env');

let cachedTransport = null;

const getTransport = () => {
  if (cachedTransport) return cachedTransport;
  if (!hasSmtp()) return null;

  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransport;
};

const sendMail = async ({ to, subject, html, text }) => {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || 'no-reply@dentalcare.local';

  if (!transport) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured');
    }
    console.log('\n[mailer] SMTP not configured — printing email to console (dev mode):');
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${text || html}\n`);
    return { previewed: true };
  }

  return transport.sendMail({ from, to, subject, text, html });
};

module.exports = { sendMail };
