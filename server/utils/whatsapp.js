// WhatsApp sender — primary: Fonnte (https://fonnte.com), fallback: console log.
// Fonnte was chosen because it accepts Indonesian numbers without business verification
// and has a simple HTTP API (one POST with token + target + message).

const hasFonnte = () => Boolean(process.env.FONNTE_TOKEN);

const normalizeNumber = (raw) => {
  if (!raw) return '';
  let n = String(raw).replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (n.startsWith('8')) n = '62' + n;
  return n;
};

const sendWhatsApp = async ({ to, message }) => {
  const number = normalizeNumber(to);
  if (!number) {
    console.warn('[whatsapp] skipped — missing target number');
    return { sent: false, reason: 'no-target' };
  }

  if (!hasFonnte()) {
    console.log('\n[whatsapp] FONNTE_TOKEN not set — printing message to console (dev mode):');
    console.log(`  To:      +${number}`);
    console.log(`  Message: ${message}\n`);
    return { sent: false, previewed: true };
  }

  try {
    const body = new URLSearchParams({ target: number, message, countryCode: '62' });
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: { Authorization: process.env.FONNTE_TOKEN },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === false) {
      console.error('[whatsapp] Fonnte error:', data);
      return { sent: false, error: data.reason || `HTTP ${res.status}` };
    }
    return { sent: true, providerResponse: data };
  } catch (err) {
    console.error('[whatsapp] send error:', err.message);
    return { sent: false, error: err.message };
  }
};

module.exports = { sendWhatsApp, normalizeNumber, hasFonnte };
