/**
 * Локальный демо-сервер для записи видео без Docker:
 * — котировки BTC/USDT с публичного REST Binance (реальные рыночные данные);
 * — логин/регистрация и кошелёк USDT имитируют ответ gateway для UI.
 */
import http from 'node:http';
import https from 'node:https';

const PORT = Number(process.env.DEMO_API_PORT || 3099);
const OKX = 'https://www.okx.com';

let snapshot = {
  ticker: null,
  orderBook: null,
  trades: [],
};

function fetchJson(base, path) {
  return new Promise((resolve, reject) => {
    https
      .get(`${base}${path}`, { headers: { Accept: 'application/json' } }, (res) => {
        let raw = '';
        res.on('data', (c) => {
          raw += c;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

async function refreshMarket() {
  const [tickRes, obRes, trRes] = await Promise.all([
    fetchJson(OKX, '/api/v5/market/ticker?instId=BTC-USDT'),
    fetchJson(OKX, '/api/v5/market/books?instId=BTC-USDT&sz=20'),
    fetchJson(OKX, '/api/v5/market/trades?instId=BTC-USDT&limit=12'),
  ]);

  const t = tickRes?.data?.[0];
  if (!t) throw new Error('OKX ticker: empty data');

  const last = Number.parseFloat(t.last);
  const open = Number.parseFloat(t.open24h);
  const pct = Number.isFinite(last) && Number.isFinite(open) && open !== 0 ? ((last - open) / open) * 100 : undefined;
  const change = Number.isFinite(last) && Number.isFinite(open) ? last - open : undefined;

  snapshot.ticker = {
    symbol: 'BTC/USDT',
    last,
    high: Number.parseFloat(t.high24h),
    low: Number.parseFloat(t.low24h),
    percentage: pct,
    change,
    baseVolume: Number.parseFloat(t.vol24h),
    quoteVolume: Number.parseFloat(t.volCcy24h),
    timestamp: Number.parseInt(t.ts, 10) || Date.now(),
  };

  const ob = obRes?.data?.[0];
  snapshot.orderBook = {
    symbol: 'BTC/USDT',
    timestamp: ob?.ts ? Number.parseInt(ob.ts, 10) : Date.now(),
    bids: (ob?.bids || []).slice(0, 12).map((x) => [Number.parseFloat(x[0]), Number.parseFloat(x[1])]),
    asks: (ob?.asks || []).slice(0, 12).map((x) => [Number.parseFloat(x[0]), Number.parseFloat(x[1])]),
  };

  const list = trRes?.data || [];
  snapshot.trades = list.map((row, i) => ({
    id: String(row.tradeId || row.ts || i),
    timestamp: Number.parseInt(row.ts, 10),
    datetime: new Date(Number.parseInt(row.ts, 10)).toISOString(),
    side: String(row.side).toLowerCase() === 'buy' ? 'buy' : 'sell',
    price: Number.parseFloat(row.px),
    amount: Number.parseFloat(row.sz),
  }));
}

function sendJson(res, status, body, cors = true) {
  const data = JSON.stringify(body);
  if (cors) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

const users = new Map();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/spot/ticker/')) {
    return sendJson(res, 200, snapshot.ticker || {});
  }
  if (req.method === 'GET' && url.pathname.startsWith('/spot/orderbook/')) {
    return sendJson(res, 200, snapshot.orderBook || { bids: [], asks: [] });
  }
  if (req.method === 'GET' && url.pathname.startsWith('/spot/trades/')) {
    return sendJson(res, 200, snapshot.trades || []);
  }

  if (req.method === 'GET' && url.pathname === '/api/wallet/me/usdt') {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const email = users.get(token);
    if (!email) {
      return sendJson(res, 401, { message: 'Invalid or expired token' });
    }
    return sendJson(res, 200, {
      id: 'demo-wallet',
      userId: 'demo-user',
      currency: 'USDT',
      balance: 1000,
      lockedBalance: 0,
      totalDeposited: 1000,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  if (
    req.method === 'POST' &&
    (url.pathname === '/api/users/auth/register' || url.pathname === '/api/users/auth/register/')
  ) {
    let body = '';
    for await (const chunk of req) body += chunk;
    let parsed;
    try {
      parsed = JSON.parse(body || '{}');
    } catch {
      return sendJson(res, 400, { message: 'Invalid JSON' });
    }
    const email = parsed.email || `user${Date.now()}@demo.local`;
    const accessToken = `demo-${Buffer.from(email).toString('hex').slice(0, 24)}`;
    users.set(accessToken, email);
    return sendJson(res, 201, {
      accessToken,
      refreshToken: 'demo-refresh',
      user: {
        id: 'demo-user',
        email,
        username: email,
        firstName: parsed.firstName || 'Demo',
        lastName: parsed.lastName || 'Trader',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  if (
    req.method === 'POST' &&
    (url.pathname === '/api/users/auth/login' || url.pathname === '/api/users/auth/login/')
  ) {
    let body = '';
    for await (const chunk of req) body += chunk;
    let parsed;
    try {
      parsed = JSON.parse(body || '{}');
    } catch {
      return sendJson(res, 400, { message: 'Invalid JSON' });
    }
    const email = parsed.email || 'demo@local';
    const accessToken = `demo-${Buffer.from(email).toString('hex').slice(0, 24)}`;
    users.set(accessToken, email);
    return sendJson(res, 200, {
      accessToken,
      refreshToken: 'demo-refresh',
      user: {
        id: 'demo-user',
        email,
        username: email,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  sendJson(res, 404, { message: 'Not found' });
});

await refreshMarket();
setInterval(() => {
  refreshMarket().catch((e) => console.error('market refresh failed', e));
}, 30000);

server.listen(PORT, '0.0.0.0', () => {
  console.error(`Demo API on http://127.0.0.1:${PORT} (market: OKX public REST)`);
});
