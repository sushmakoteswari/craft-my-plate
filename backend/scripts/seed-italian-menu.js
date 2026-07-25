/**
 * Creates Italian menu items via POST /api/menu (admin).
 * Drives menu_items_created_total + menu.item.created traces/logs in SigNoz.
 *
 * Usage:
 *   node scripts/seed-italian-menu.js
 *   ADMIN_USER=myadmin ADMIN_PASS=secret node scripts/seed-italian-menu.js
 *   BASE_URL=http://127.0.0.1:5000 node scripts/seed-italian-menu.js
 */

const base = (process.env.BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const api = `${base}/api`;

const ADMIN_USER = process.env.ADMIN_USER || 'oteladmin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'pass123456';

const ITALIAN_ITEMS = [
  { name: 'Margherita Pizza', category: 'Italian', price: 349, availability: true },
  { name: 'Penne Arrabbiata', category: 'Italian', price: 279, availability: true },
  { name: 'Chicken Parmigiana', category: 'Italian', price: 429, availability: true },
  { name: 'Mushroom Risotto', category: 'Italian', price: 399, availability: true },
  { name: 'Lasagna Bolognese', category: 'Italian', price: 449, availability: true },
  { name: 'Bruschetta Trio', category: 'Italian', price: 199, availability: true },
  { name: 'Caprese Salad', category: 'Italian', price: 249, availability: true },
  { name: 'Tiramisu', category: 'Italian', price: 179, availability: true },
  { name: 'Fettuccine Alfredo', category: 'Italian', price: 319, availability: true },
  { name: 'Minestrone Soup', category: 'Italian', price: 159, availability: true },
];

async function loginAdmin() {
  let res = await fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  });
  let data = await res.json();
  if (res.ok && data.token) return data.token;

  res = await fetch(`${api}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: ADMIN_USER,
      email: `${ADMIN_USER}@seed.test`,
      password: ADMIN_PASS,
      role: 'admin',
    }),
  });
  data = await res.json();
  if (res.ok && data.token) {
    console.log(`Registered admin user "${ADMIN_USER}" for seeding.`);
    return data.token;
  }

  throw new Error(data.message || `Admin login failed for ${ADMIN_USER}`);
}

async function existingNames() {
  const res = await fetch(`${api}/menu`);
  if (!res.ok) return new Set();
  const items = await res.json();
  return new Set(items.map((i) => i.name));
}

async function createItem(token, item) {
  const res = await fetch(`${api}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  const token = await loginAdmin();
  const names = await existingNames();
  let created = 0;
  let skipped = 0;

  for (const item of ITALIAN_ITEMS) {
    if (names.has(item.name)) {
      console.log(`skip (exists): ${item.name}`);
      skipped += 1;
      continue;
    }
    const { status, data } = await createItem(token, item);
    if (status === 201) {
      console.log(`created: ${item.name} (₹${item.price})`);
      created += 1;
    } else {
      console.error(`failed ${item.name}: ${status}`, data.message || data);
    }
  }

  console.log(`\nDone — created ${created}, skipped ${skipped}, total Italian items in script: ${ITALIAN_ITEMS.length}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
