// License validation endpoint — server-side check that can't be bypassed by editing localStorage.
// Set env var on Netlify: LICENSE_SECRET (any string — must match the secret used by your code generator)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function licenseChecksum(dateStr, secret) {
  const input = dateStr + secret;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h) + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36).toUpperCase().slice(0, 4).padStart(4, '0');
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  }

  const secret = process.env.LICENSE_SECRET;
  if (!secret) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) };
  }

  const code = (body.code || '').toUpperCase().trim();
  const m = code.match(/^THRIFT-(\d{4}-\d{2}-\d{2})-([A-Z0-9]{4})$/);
  if (!m) {
    return { statusCode: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify({ valid: false, reason: 'invalid_format' }) };
  }
  const [, dateStr, checksum] = m;
  if (licenseChecksum(dateStr, secret) !== checksum) {
    return { statusCode: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify({ valid: false, reason: 'invalid_checksum' }) };
  }
  const today = new Date().toISOString().split('T')[0];
  if (dateStr <= today) {
    return { statusCode: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify({ valid: false, reason: 'expired', expiry: dateStr }) };
  }
  return { statusCode: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify({ valid: true, expiry: dateStr }) };
};
