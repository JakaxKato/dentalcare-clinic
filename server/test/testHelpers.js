const mongoose = require('mongoose');

// Force a safe test environment BEFORE anything (dotenv, server.js) reads it.
// dotenv only fills vars that are not already set, so we must pin these here.
process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'test';
process.env.SEED_MODE = 'disabled';
process.env.ALLOW_DEMO_ACCOUNTS = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testtesttesttesttesttesttesttest';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
process.env.MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dentalcare-test';

// Connect to the test database. `MONGO_URI` is expected to be set by the test
// environment (e.g. the MongoDB service container in CI).
const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
};

// Drop all collections so each test file starts clean. Only run against a test
// database; the URI is validated to reject any suspicious test/prod naming.
const dropTestDB = async () => {
  if (!process.env.MONGO_URI || /(prod|production|live)/i.test(process.env.MONGO_URI)) {
    return;
  }
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    await db.collection(c.name).deleteMany({});
  }
};

const disconnectTestDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectTestDB, dropTestDB, disconnectTestDB };
