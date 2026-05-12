// Claude API proxy — keeps your Anthropic key on the server.
// Validates the caller has a valid license before proxying.
// Set env vars on Netlify: ANTHROPIC_API_KEY, LICENSE_SECRET

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-license',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple HMAC-style check matching the client license format: THRIFT-YYYY-MM-DD-XXXX
function licenseChecksum(dateStr, secret) {
  const input = dateStr + secret;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h) + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36).toUpperCase().slice(0, 4).padStart(4, '0');
}

function validateLicense(code, secret) {
  if (!code) return false;
  const m = code.toUpperCase().trim().match(/^THRIFT-(\d{4}-\d{2}-\d{2})-([A-Z0-9]{4})$/);
  if (!m) return false;
  const [, dateStr, checksum] = m;
  if (licenseChecksum(dateStr, secret) !== checksum) return false;
  // Check expiry
  const today = new Date().toISOString().split('T')[0];
  if (dateStr <= today) return false;
  return true;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server not configured — ANTHROPIC_API_KEY env var missing' }) };
  }

  // Optional license gate — if LICENSE_SECRET is set, require a valid license header
  const licenseSecret = process.env.LICENSE_SECRET;
  if (licenseSecret) {
    const license = event.headers['x-license'] || event.headers['X-License'];
    if (!validateLicense(license, licenseSecret)) {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Invalid or expired license' }) };
    }
  }

  let body;
  try { body = JSON.parse(event.body); } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) };
  }

  // Forward to Anthropic
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    // Support streaming: if client requested it, pipe through
    if (body.stream) {
      // Netlify functions don't easily stream — return the body anyway
      // (most clients will fall back to parsing the full response)
      const text = await res.text();
      return {
        statusCode: res.status,
        headers: { ...CORS, 'content-type': res.headers.get('content-type') || 'text/event-stream' },
        body: text,
      };
    }

    const text = await res.text();
    return {
      statusCode: res.status,
      headers: { ...CORS, 'content-type': 'application/json' },
      body: text,
    };
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
