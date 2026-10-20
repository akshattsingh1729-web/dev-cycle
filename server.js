/**
 * DEV CYCLE - Cross-Platform HTTP & Auth Server
 * Serves static assets, clean routes, and environment configuration (.env -> /env.js).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function parseEnvFile() {
  const envPath = path.join(BASE_DIR, '.env');
  const envVars = {
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: ''
  };

  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key in envVars || key.startsWith('VITE_')) {
            envVars[key] = val;
          }
        }
      }
    } catch (e) {
      console.warn('[Server] Could not parse .env file:', e.message);
    }
  }

  // Fallbacks if not set in .env
  if (!envVars.VITE_SUPABASE_URL) {
    envVars.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wzjqntgujuptcfxklcxt.supabase.co';
  }
  if (!envVars.VITE_SUPABASE_ANON_KEY) {
    envVars.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6anFudGd1anVwdGNmeGtsY3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzk5MDUsImV4cCI6MjEwNzY1NTkwNX0.T3BZ_QPrXUcww0nByZLWxa-hB6dhH7yqkH9ItWPQFyc';
  }

  return envVars;
}

const server = http.createServer((req, res) => {
  // Global CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL pathname
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath.startsWith('/')) {
    reqPath = reqPath.slice(1);
  }
  if (!reqPath) {
    reqPath = 'index.html';
  }

  // 1. Dynamic /env.js endpoint to inject .env into browser
  if (reqPath === 'env.js') {
    const envVars = parseEnvFile();
    const envPayload = `window.__ENV__ = ${JSON.stringify(envVars, null, 2)};`;
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(envPayload);
    return;
  }

  // Clean Route Mappings
  const ROUTE_MAP = {
    'login': 'login.html',
    'signup': 'signup.html',
    'forgot-password': 'forgot-password.html',
    'reset-password': 'reset-password.html',
    'dashboard': 'dashboard.html',
    'profile': 'profile.html',
    'auth/callback': 'auth-callback.html'
  };

  const normalizedPath = reqPath.replace(/\/$/, '');
  if (ROUTE_MAP[normalizedPath]) {
    reqPath = ROUTE_MAP[normalizedPath];
  }

  let filePath = path.join(BASE_DIR, reqPath);
  filePath = path.normalize(filePath);

  // Security check: Must reside within BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  // If file doesn't exist, check for .html extension or directory index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>404 Not Found | DEV CYCLE</title>
        <link rel="stylesheet" href="/css/style.css">
        <link rel="stylesheet" href="/css/auth.css">
      </head>
      <body class="auth-page-wrapper" style="display:flex; align-items:center; justify-content:center;">
        <div class="auth-card" style="text-align:center;">
          <h1 style="color:#fff; font-size:2rem; margin-bottom:1rem;">404 - Page Not Found</h1>
          <p style="color:#94a3b8; margin-bottom:1.5rem;">The requested page could not be located on the server.</p>
          <a href="/index.html" class="btn-primary" style="display:inline-block; padding:0.75rem 1.5rem;">Return to Showroom</a>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log('==========================================================');
  console.log('  DEV CYCLE - 3D Showroom & Supabase Auth Server');
  console.log(`  Running at: http://localhost:${PORT}`);
  console.log('==========================================================');
  console.log('  Routes:');
  console.log('  - Showroom:        http://localhost:3000/');
  console.log('  - Sign In:         http://localhost:3000/login');
  console.log('  - Sign Up:         http://localhost:3000/signup');
  console.log('  - Forgot Password: http://localhost:3000/forgot-password');
  console.log('  - Reset Password:  http://localhost:3000/reset-password');
  console.log('  - User Dashboard:  http://localhost:3000/dashboard');
  console.log('  - Account Profile: http://localhost:3000/profile');
  console.log('  - Auth Callback:   http://localhost:3000/auth/callback');
  console.log('==========================================================');
});
