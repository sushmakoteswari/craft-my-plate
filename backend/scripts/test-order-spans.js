const menuId = '67a9ae20e520072e1925766e';
const base = 'http://127.0.0.1:5000/api';

async function login(username, password) {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`login failed: ${data.message}`);
  return data.token;
}

async function postOrder(token, quantity) {
  const res = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items: [{ menuItem: menuId, quantity }] }),
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 120) };
}

async function getAllOrders(token) {
  const res = await fetch(`${base}/orders/allorders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 120) };
}

async function main() {
  const token = await login('oteluser2', 'pass123456');
  console.log('1) Over-stock order (qty 999):', await postOrder(token, 999));
  console.log('2) Normal order (qty 1):', await postOrder(token, 1));
  console.log('3) RBAC allorders as user:', await getAllOrders(token));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
