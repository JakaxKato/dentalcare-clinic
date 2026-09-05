const test = require('node:test');
const assert = require('node:assert/strict');
const { connectTestDB, dropTestDB, disconnectTestDB } = require('./testHelpers');

// Build the Express app and start it on an ephemeral port. Starting at the
// top of the file means every test shares one server instance; each test
// cleans its own data via dropTestDB. If MongoDB is unreachable (e.g. local
// dev without a running Mongo), we skip so the suite does not hang.
let server;
let baseUrl;
let dbReady = false;

test.before(async () => {
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

test('register creates a patient and sets an auth cookie', { skip: !dbReady }, async () => {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Pasien',
      email: 'pasien@test.com',
      password: 'password123',
    }),
  });

  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.user.name, 'Test Pasien');
  // Cookie set on registration.
  const setCookie = res.headers.get('set-cookie') || '';
  assert.match(setCookie, /dc_access=/);
});

test('login returns the user and a cookie', { skip: !dbReady }, async () => {
  const { email, password } = await createUser();

  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.user.email, email);
  assert.match(res.headers.get('set-cookie') || '', /dc_access=/);
});

test('me requires authentication', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(res.status, 401);
});

test('me returns the current user when authenticated', { skip: !dbReady }, async () => {
  const cookie = await loginCookie();

  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: cookie },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data.email);
});

async function createUser() {
  const email = `user_${Date.now()}@test.com`;
  const password = 'password123';
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User Test', email, password }),
  });
  assert.equal(res.status, 201);
  return { email, password };
}

async function loginCookie() {
  const { email, password } = await createUser();
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get('set-cookie');
  return setCookie.split(';')[0];
}
