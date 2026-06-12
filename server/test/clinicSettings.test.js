const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeClinicSettings,
  serializeClinicSettings,
} = require('../utils/clinicSettings');

test('clinic settings normalize allowed values', () => {
  assert.deepEqual(
    normalizeClinicSettings({
      clinicName: '  Smile Dental  ',
      primaryColor: '#AABBCC',
      email: ' INFO@EXAMPLE.COM ',
      ignored: 'value',
    }),
    {
      clinicName: 'Smile Dental',
      primaryColor: '#aabbcc',
      email: 'info@example.com',
    }
  );
});

test('clinic settings reject invalid brand values', () => {
  assert.throws(
    () => normalizeClinicSettings({ clinicName: '  ' }),
    /clinicName is required/
  );
  assert.throws(
    () => normalizeClinicSettings({ primaryColor: 'blue' }),
    /valid hex color/
  );
  assert.throws(
    () => normalizeClinicSettings({ email: 'invalid' }),
    /email must be valid/
  );
});

test('clinic settings serialize only public fields', () => {
  const serialized = serializeClinicSettings({
    clinicName: 'Clinic',
    primaryColor: '#123456',
    singletonKey: 'main',
  });

  assert.equal(serialized.clinicName, 'Clinic');
  assert.equal(serialized.primaryColor, '#123456');
  assert.equal('singletonKey' in serialized, false);
});
