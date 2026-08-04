const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];

const getDeploymentEnv = () => process.env.APP_ENV || process.env.NODE_ENV || 'development';

const isProduction = () => getDeploymentEnv() === 'production';

const validateEnv = () => {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`\n[env] Missing required environment variables: ${missing.join(', ')}`);
    console.error('[env] See server/.env.example for the full list.\n');
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('\n[env] JWT_SECRET must be at least 32 characters for production safety.\n');
    process.exit(1);
  }

  if (isProduction() && process.env.ALLOW_DEMO_ACCOUNTS === 'true') {
    console.error('\n[env] Demo accounts must be disabled in production.\n');
    process.exit(1);
  }

  if (isProduction() && process.env.SEED_MODE !== 'disabled') {
    console.error('\n[env] Destructive seed must be disabled in production.\n');
    process.exit(1);
  }

  if (isProduction() && /:\/\/127\.0\.0\.1|:\/\/localhost|(?:^|[_-])(test|demo)(?:[_-]|$|\?)/i.test(process.env.MONGO_URI)) {
    console.error('\n[env] Production must use a dedicated production database.\n');
    process.exit(1);
  }

  const midtransKeys = [
    process.env.MIDTRANS_SERVER_KEY,
    process.env.MIDTRANS_CLIENT_KEY,
  ].filter(Boolean);
  if (midtransKeys.length === 1) {
    console.error('\n[env] MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY must be set together.\n');
    process.exit(1);
  }

  for (const key of ['DP_PERCENT', 'DP_MIN_AMOUNT']) {
    if (process.env[key] !== undefined && (!Number.isFinite(Number(process.env[key])) || Number(process.env[key]) < 0)) {
      console.error(`\n[env] ${key} must be a non-negative number.\n`);
      process.exit(1);
    }
  }
};

const getCorsOrigins = () => {
  const raw = process.env.CLIENT_URL || '';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (!isProduction() && list.length === 0) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }
  return list;
};

const hasCloudinary = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const hasSmtp = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

module.exports = { validateEnv, getCorsOrigins, hasCloudinary, hasSmtp };
