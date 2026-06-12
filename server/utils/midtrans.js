// Midtrans Snap integration. Returns a singleton snap client, or null when keys missing.
// In dev without keys: we generate a fake snapToken so the UI flow is still demonstrable.

const midtransClient = require('midtrans-client');

let cachedSnap = null;

const hasMidtrans = () =>
  Boolean(process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY);

const getSnap = () => {
  if (cachedSnap) return cachedSnap;
  if (!hasMidtrans()) return null;
  cachedSnap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
  return cachedSnap;
};

const getCoreApi = () => {
  if (!hasMidtrans()) return null;
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
};

module.exports = { hasMidtrans, getSnap, getCoreApi };
