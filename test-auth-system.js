/**
 * DEV CYCLE - Authentication System Automated Verification Test
 * Tests server routing, /env.js dynamic injection, static files, and Supabase client connectivity.
 */

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const path = require('path');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function fetchHttps(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- Starting DEV CYCLE Auth System Verification ---');
  
  // 1. Start local server
  const serverProcess = spawn('node', ['server.js'], { cwd: __dirname });
  
  serverProcess.stdout.on('data', d => console.log('[Server stdout]', d.toString().trim()));
  serverProcess.stderr.on('data', d => console.error('[Server stderr]', d.toString().trim()));

  await wait(1200);

  let allPassed = true;
  const baseUrl = 'http://localhost:3000';

  const testEndpoints = [
    { name: 'Showroom Home (/)', path: '/', expectedStatus: 200, checkContent: 'DEV CYCLE' },
    { name: 'Sign In Page (/login)', path: '/login', expectedStatus: 200, checkContent: 'login-form' },
    { name: 'Sign Up Page (/signup)', path: '/signup', expectedStatus: 200, checkContent: 'signup-form' },
    { name: 'Forgot Password (/forgot-password)', path: '/forgot-password', expectedStatus: 200, checkContent: 'forgot-form' },
    { name: 'Reset Password (/reset-password)', path: '/reset-password', expectedStatus: 200, checkContent: 'reset-form' },
    { name: 'Dashboard (/dashboard)', path: '/dashboard', expectedStatus: 200, checkContent: 'protected-page-content' },
    { name: 'Profile (/profile)', path: '/profile', expectedStatus: 200, checkContent: 'profile-details-form' },
    { name: 'Auth Callback (/auth/callback)', path: '/auth/callback', expectedStatus: 200, checkContent: 'callback-loading-state' },
    { name: 'Dynamic Environment Script (/env.js)', path: '/env.js', expectedStatus: 200, checkContent: 'window.__ENV__' },
    { name: 'Supabase JS Lib (/js/libs/supabase.js)', path: '/js/libs/supabase.js', expectedStatus: 200, checkContent: 'createClient' },
    { name: 'Auth CSS (/css/auth.css)', path: '/css/auth.css', expectedStatus: 200, checkContent: 'auth-card' }
  ];

  for (const endpoint of testEndpoints) {
    try {
      const res = await fetchUrl(baseUrl + endpoint.path);
      const passedStatus = res.statusCode === endpoint.expectedStatus;
      const passedContent = res.body.includes(endpoint.checkContent);
      if (passedStatus && passedContent) {
        console.log(`✅ [PASS] ${endpoint.name} - Status: ${res.statusCode}`);
      } else {
        console.error(`❌ [FAIL] ${endpoint.name} - Status: ${res.statusCode}, Contains check: ${passedContent}`);
        allPassed = false;
      }
    } catch (e) {
      console.error(`❌ [ERROR] ${endpoint.name} - Request failed:`, e.message);
      allPassed = false;
    }
  }

  // 2. Test Supabase live endpoint with anon key
  console.log('\n--- Testing Supabase Live Auth Backend ---');
  try {
    const envRes = await fetchUrl(baseUrl + '/env.js');
    const matchUrl = envRes.body.match(/"VITE_SUPABASE_URL":\s*"([^"]+)"/);
    const matchKey = envRes.body.match(/"VITE_SUPABASE_ANON_KEY":\s*"([^"]+)"/);
    
    if (matchUrl && matchKey) {
      const sbUrl = matchUrl[1];
      const sbKey = matchKey[1];
      console.log(`Detected Supabase Endpoint: ${sbUrl}`);

      const sbSettings = await fetchHttps(`${sbUrl}/auth/v1/settings`, {
        'apikey': sbKey
      });

      if (sbSettings.statusCode === 200) {
        const parsed = JSON.parse(sbSettings.body);
        console.log(`✅ [PASS] Supabase Cloud Auth Online! Email Auth Enabled: ${parsed.external?.email}`);
      } else {
        console.warn(`⚠️ [NOTICE] Supabase returned status ${sbSettings.statusCode}: ${sbSettings.body}`);
      }
    }
  } catch (e) {
    console.warn('⚠️ [NOTICE] Supabase live ping error:', e.message);
  }

  // Teardown
  serverProcess.kill();
  await wait(400);

  console.log('\n==========================================================');
  if (allPassed) {
    console.log('🎉 ALL DEV CYCLE AUTH VERIFICATION CHECKS PASSED!');
  } else {
    console.error('❌ SOME CHECKS FAILED. Please review above.');
    process.exit(1);
  }
  console.log('==========================================================');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
