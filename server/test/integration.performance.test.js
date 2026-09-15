const test = require('node:test');
const assert = require('node:assert/strict');
const { connectTestDB, dropTestDB, disconnectTestDB } = require('./testHelpers');
const Article = require('../models/Article');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');
const DentistLeave = require('../models/DentistLeave');

// Same boot pattern as integration.auth.test.js: one server per file, tests
// skipped when MongoDB is unreachable.
let server;
let baseUrl;
let dbReady = false;

const skipIfNoDb = (t) => {
  if (!dbReady) {
    t.skip('MongoDB unavailable');
    return true;
  }
  return false;
};

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

async function createAuthor() {
  return User.create({
    name: 'Penulis Test',
    email: `author_${Date.now()}@test.com`,
    password: 'password123',
    role: 'admin',
  });
}

test('GET /api/articles respects pagination and omits content from list', async (t) => {
  if (skipIfNoDb(t)) return;
  const author = await createAuthor();
  await Article.create([
    { title: 'Artikel Satu', content: 'Isi panjang satu', authorId: author._id, published: true },
    { title: 'Artikel Dua', content: 'Isi panjang dua', authorId: author._id, published: true },
    { title: 'Artikel Tiga', content: 'Isi panjang tiga', authorId: author._id, published: true },
  ]);

  const res = await fetch(`${baseUrl}/api/articles?limit=2`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.count, 3);
  assert.equal(body.page, 1);
  assert.equal(body.totalPages, 2);
  assert.equal(body.data.length, 2);
  for (const item of body.data) {
    assert.ok(!('content' in item), 'list item must not include content field');
    assert.ok(item.title && item.slug, 'list item keeps summary fields');
  }

  const res2 = await fetch(`${baseUrl}/api/articles?limit=2&page=2`);
  const body2 = await res2.json();
  assert.equal(body2.data.length, 1);
});

test('GET /api/testimonials respects limit and returns total count', async (t) => {
  if (skipIfNoDb(t)) return;
  await Testimonial.create([
    { patientName: 'A', rating: 5, message: 'Bagus', isApproved: true },
    { patientName: 'B', rating: 4, message: 'Oke', isApproved: true },
    { patientName: 'C', rating: 5, message: 'Mantap', isApproved: true },
  ]);

  const res = await fetch(`${baseUrl}/api/testimonials?limit=2`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.count, 3);
  assert.equal(body.totalPages, 2);
  assert.equal(body.data.length, 2);
});

test('GET /api/dentist-leaves is bounded and paginated for dentists', async (t) => {
  if (skipIfNoDb(t)) return;
  const dentist = await User.create({
    name: 'Dokter Test',
    email: `dent_${Date.now()}@test.com`,
    password: 'password123',
    role: 'dentist',
  });
  const start = new Date('2026-09-20T00:00:00.000Z');
  const end = new Date('2026-09-21T00:00:00.000Z');
  await DentistLeave.create([
    { dentistId: dentist._id, startDate: start, endDate: end, reason: 'Cuti' },
    { dentistId: dentist._id, startDate: start, endDate: end, reason: 'Sakit' },
    { dentistId: dentist._id, startDate: start, endDate: end, reason: 'Seminar/Pelatihan' },
  ]);

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: dentist.email, password: 'password123' }),
  });
  const cookie = login.headers.get('set-cookie').split(';')[0];

  const res = await fetch(`${baseUrl}/api/dentist-leaves`, {
    headers: { Cookie: cookie },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.count, 3);
  assert.equal(body.page, 1);
  assert.equal(body.totalPages, 1);
  assert.equal(body.data.length, 3);
});
