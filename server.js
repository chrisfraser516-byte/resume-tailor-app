// server.js
// Tiny backend for the resume tailoring app — no npm dependencies required.
// Keeps the Anthropic API key on the server; the browser never sees it.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// ---- Load .env file manually (no dotenv package needed) ----
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    // strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile();

const API_KEY = process.env.ANTHROPIC_API_KEY;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function serveStaticFile(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, 'public', decodeURIComponent(filePath.split('?')[0]));

  // Prevent path traversal outside the public folder
  const publicDir = path.join(__dirname, 'public');
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function handleTailorRequest(req, res) {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    if (!API_KEY) {
      sendJson(res, 500, {
        error: 'No API key found on the server. Create a .env file with ANTHROPIC_API_KEY=your-key and restart the server.'
      });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid request body.' });
      return;
    }

    const { systemPrompt, userPrompt } = parsed;
    if (!systemPrompt || !userPrompt) {
      sendJson(res, 400, { error: 'Missing systemPrompt or userPrompt in request.' });
      return;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Anthropic API error:', JSON.stringify(data));
        sendJson(res, response.status, {
          error: (data.error && data.error.message) || 'Anthropic API request failed.'
        });
        return;
      }

      sendJson(res, 200, data);
    } catch (err) {
      console.error('Server error calling Anthropic API:', err);
      sendJson(res, 500, { error: 'Server error reaching Anthropic API: ' + err.message });
    }
  });
}

function sendJson(res, statusCode, obj) {
  const json = JSON.stringify(obj);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(json);
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/tailor') {
    handleTailorRequest(req, res);
    return;
  }
  if (req.method === 'GET') {
    serveStaticFile(req, res);
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n  Sharpen is running!`);
  console.log(`  Open this in your browser: http://localhost:${PORT}\n`);
  if (!API_KEY) {
    console.log('  ⚠️  WARNING: ANTHROPIC_API_KEY is not set. Create a .env file — see .env.example.\n');
  }
});
