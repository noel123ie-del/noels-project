// HeyGen API proxy — keeps your HeyGen key on the server.
// Set env var on Netlify: HEYGEN_API_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, x-license',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
function validateLicense(code, secret) {
  if (!code) return false;
  const m = code.toUpperCase().trim().match(/^THRIFT-(\d{4}-\d{2}-\d{2})-([A-Z0-9]{4})$/);
  if (!m) return false;
  const [, dateStr, checksum] = m;
  if (licenseChecksum(dateStr, secret) !== checksum) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateStr > today;
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Server not configured — HEYGEN_API_KEY env var missing' }) };
  }

  const licenseSecret = process.env.LICENSE_SECRET;
  if (licenseSecret) {
    const license = event.headers['x-license'] || event.headers['X-License'];
    if (!validateLicense(license, licenseSecret)) {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Invalid or expired license' }) };
    }
  }

  // Path-based routing via query param `action`
  const action = event.queryStringParameters?.action || 'generate';
  try {
    if (action === 'generate') {
      // POST /generate — generate a video from text
      let body;
      try { body = JSON.parse(event.body); } catch (e) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON' }) };
      }
      const res = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      return { statusCode: res.status, headers: { ...CORS, 'content-type': 'application/json' }, body: text };
    }
    if (action === 'status') {
      const videoId = event.queryStringParameters?.video_id;
      if (!videoId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'video_id required' }) };
      const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: { 'x-api-key': apiKey },
      });
      const text = await res.text();
      return { statusCode: res.status, headers: { ...CORS, 'content-type': 'application/json' }, body: text };
    }
    if (action === 'avatars') {
      const res = await fetch('https://api.heygen.com/v2/avatars', {
        headers: { 'x-api-key': apiKey },
      });
      const text = await res.text();
      return { statusCode: res.status, headers: { ...CORS, 'content-type': 'application/json' }, body: text };
    }
    if (action === 'streaming-token') {
      // For Interactive/Streaming Avatar — mints a session token
      const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
      });
      const text = await res.text();
      return { statusCode: res.status, headers: { ...CORS, 'content-type': 'application/json' }, body: text };
    }
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (e) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
