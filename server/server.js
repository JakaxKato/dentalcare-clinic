require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');

const { validateEnv, getCorsOrigins } = require('./config/env');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

validateEnv();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dentistRoutes = require('./routes/dentistRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const articleRoutes = require('./routes/articleRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const clinicSettingsRoutes = require('./routes/clinicSettingsRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

const allowedOrigins = getCorsOrigins();
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize({ replaceWith: '_' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API documentation (Swagger UI) — disabled in test to keep boot lean
if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_SWAGGER !== 'true') {
  try {
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const openapi = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(openapi, { customSiteTitle: 'DentalCare API Docs' })
    );
    app.get('/api/docs.json', (req, res) => res.json(openapi));
  } catch (err) {
    console.warn('[swagger] disabled:', err.message);
  }
}

// Health check — includes database connectivity status
app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = mongoose.connection.readyState;
  res.json({
    success: true,
    status: dbState === 1 ? 'ok' : 'degraded',
    uptime: process.uptime(),
    database: dbStates[dbState] || 'unknown',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dentists', dentistRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/clinic-settings', clinicSettingsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const { startReminderScheduler } = require('./utils/reminderJob');

let server;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
    if (process.env.DISABLE_REMINDER !== 'true') startReminderScheduler();
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown — close HTTP server and MongoDB connection on termination signals
const shutdown = async (signal) => {
  console.log(`\n[shutdown] ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[shutdown] HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        console.log('[shutdown] MongoDB connection closed.');
        process.exit(0);
      });
    });
    // Force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      console.error('[shutdown] Forced exit after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

if (require.main === module) {
  start();
}

module.exports = app;
