/**
 * Sends many sequential HTTP requests to craft-my-plate API
 * so SigNoz can build latency-by-route metrics.
 *
 * Usage:
 *   node scripts/load-traffic-for-metrics.js
 *   node scripts/load-traffic-for-metrics.js 200
 *   BASE_URL=http://127.0.0.1:5000 node scripts/load-traffic-for-metrics.js 150
 */

const base = (process.env.BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const api = `${base}/api`;
const totalHits = Math.max(1, parseInt(process.argv[2] || '150', 10));

const TEST_USER = process.env.LOAD_USER || 'oteluser2';
const TEST_PASS = process.env.LOAD_PASS || 'pass123456';

async function request(label, url, options = {}) {
  const start = Date.now();
  let status = 0;
  try {
    const res = await fetch(url, options);
    status = res.status;
    await res.text();
  } catch (err) {
    console.error(`${label} FAILED:`, err.message);
    return { label, status: 0, ms: Date.now() - start };
  }
  const ms = Date.now() - start;
  return { label, status, ms };
}

async function login() {
  let res = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TEST_USER, password: TEST_PASS }),
  });
  let data = await res.json();
  if (res.ok && data.token) return data.token;

  res = await fetch(`${api}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: TEST_USER,
      email: `${TEST_USER}@load.test`,
      password: TEST_PASS,
      role: 'user',
    }),
  });
  data = await res.json();
  if (res.ok && data.token) return data.token;

  throw new Error(data.message || 'Could not login or register test user');
}

async function fetchMenuIds() {
  const res = await fetch(`${api}/menu`);
  const items = await res.json();
  if (!res.ok || !Array.isArray(items) || items.length === 0) {
    throw new Error('Could not load menu items');
  }
  return items.slice(0, 5).map((item) => item._id);
}

function buildScenarios(token, menuIds) {
  const menuId = menuIds[0];
  const auth = token ? { Authorization: `Bearer ${token}` } : {};

  return [
    {
      name: 'GET /api/menu',
      run: () => request('GET /api/menu', `${api}/menu`),
    },
    {
      name: 'POST /api/auth/login',
      run: () =>
        request('POST /api/auth/login', `${api}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: TEST_USER, password: TEST_PASS }),
        }),
    },
    {
      name: 'GET /api/authRoute/protected',
      run: () =>
        request('GET /api/authRoute/protected', `${api}/authRoute/protected`, {
          headers: auth,
        }),
    },
    {
      name: 'GET /api/orders',
      run: () =>
        request('GET /api/orders', `${api}/orders`, { headers: auth }),
    },
    {
      name: 'POST /api/orders (qty 1)',
      run: () =>
        request('POST /api/orders', `${api}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...auth },
          body: JSON.stringify({ items: [{ menuItem: menuId, quantity: 1 }] }),
        }),
    },
    {
      name: 'GET /api/orders/allorders (RBAC)',
      run: () =>
        request('GET /api/orders/allorders', `${api}/orders/allorders`, {
          headers: auth,
        }),
    },
    {
      name: 'GET /api/adminusers (RBAC)',
      run: () =>
        request('GET /api/adminusers', `${api}/adminusers`, { headers: auth }),
    },
  ];
}

async function main() {
  console.log(`Target: ${api}`);
  console.log(`Planned hits: ${totalHits} (one at a time, sequential)\n`);

  const token = await login();
  const menuIds = await fetchMenuIds();
  const scenarios = buildScenarios(token, menuIds);

  let ok = 0;
  let fail = 0;

  for (let i = 1; i <= totalHits; i += 1) {
    const scenario = scenarios[(i - 1) % scenarios.length];
    const result = await scenario.run();
    if (result.status > 0) ok += 1;
    else fail += 1;

    if (i % 25 === 0 || i === totalHits) {
      console.log(
        `[${i}/${totalHits}] last=${scenario.name} status=${result.status} ${result.ms}ms`
      );
    }
  }

  console.log(`\nDone. ${ok} responses, ${fail} failures.`);
  console.log('Wait ~20s, then refresh SigNoz metrics (http.route or signoz_latency + operation).');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
