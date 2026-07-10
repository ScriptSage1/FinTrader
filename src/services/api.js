import {
  initialStocks,
  initialHoldings,
  initialTradeHistory,
  BACKEND_TICKERS,
  buildPriceHistory,
} from '../utils/mockData';

// Base URL for the FastAPI backend (proxied through Vite in dev)
const BACKEND_BASE = '/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Delay helper (keeps the UI feel snappy but not instant)
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Auth & Account (localStorage-backed, no backend endpoint needed) ─────────

function getUsers() {
  const stored = localStorage.getItem('fintrader_users');
  return stored ? JSON.parse(stored) : [{ username: 'admin', password: 'password123', name: 'Practice Trader' }];
}

const DATA_VERSION = 'v2-nse'; // bump this to force a cache reset

function ensureDefaults() {
  // If the stored data is from an old version (US tickers), wipe it
  if (localStorage.getItem('fintrader_data_version') !== DATA_VERSION) {
    localStorage.removeItem('fintrader_stocks');
    localStorage.removeItem('fintrader_holdings');
    localStorage.removeItem('fintrader_history');
    localStorage.removeItem('fintrader_balance');
    localStorage.setItem('fintrader_data_version', DATA_VERSION);
  }

  if (!localStorage.getItem('fintrader_users')) {
    localStorage.setItem('fintrader_users', JSON.stringify([
      { username: 'admin', password: 'password123', name: 'Practice Trader' }
    ]));
  }
  if (!localStorage.getItem('fintrader_holdings')) {
    localStorage.setItem('fintrader_holdings', JSON.stringify(initialHoldings));
  }
  if (!localStorage.getItem('fintrader_history')) {
    localStorage.setItem('fintrader_history', JSON.stringify(initialTradeHistory));
  }
  if (!localStorage.getItem('fintrader_balance')) {
    localStorage.setItem('fintrader_balance', '100000.00'); // ₹1,00,000 starting balance
  }
}

// ─── Backend Stock Price Cache ─────────────────────────────────────────────────

// In-memory cache: { [ticker]: { prices: number[], dates: string[], lastFetched: number } }
const priceCache = {};

async function fetchTickerData(ticker) {
  if (priceCache[ticker] && Date.now() - priceCache[ticker].lastFetched < 60_000) {
    return priceCache[ticker];
  }
  const data = await fetchJSON(`${BACKEND_BASE}/data/${ticker}`);
  priceCache[ticker] = { prices: data.prices, dates: data.dates ?? [], lastFetched: Date.now() };
  return priceCache[ticker];
}

// Backwards-compat alias used by getStocks
async function fetchTickerPrices(ticker) {
  const cached = await fetchTickerData(ticker);
  return cached.prices;
}

// ─── Main API Service ──────────────────────────────────────────────────────────

class ApiService {
  constructor() {
    ensureDefaults();
  }

  // Auth ─────────────────────────────────────────────────────────────────────

  async login(username, password) {
    await delay(400);
    const users = getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid username or password');
    return { username: user.username, name: user.name || 'Trader', token: 'mock-jwt-token-xyz' };
  }

  async register(username, password, name = 'Practice Trader') {
    await delay(400);
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }
    const newUser = { username, password, name };
    users.push(newUser);
    localStorage.setItem('fintrader_users', JSON.stringify(users));
    return { username: newUser.username, name: newUser.name, token: 'mock-jwt-token-xyz' };
  }

  // Stocks ───────────────────────────────────────────────────────────────────

  /**
   * Fetches the latest price for every ticker from the backend and computes
   * the 1-day % change.  Falls back to the last cached value on error.
   */
  async getStocks() {
    const results = await Promise.all(
      BACKEND_TICKERS.map(async ({ symbol, name }) => {
        try {
          const prices = await fetchTickerPrices(symbol);
          const latest = prices[prices.length - 1];
          const prev = prices[prices.length - 2] ?? latest;
          const change = prev !== 0
            ? parseFloat((((latest - prev) / prev) * 100).toFixed(2))
            : 0;
          return { symbol, name, price: parseFloat(latest.toFixed(2)), change };
        } catch {
          // If the backend is down, fall back to a placeholder
          return { symbol, name, price: 0, change: 0 };
        }
      })
    );
    // Persist for portfolio calculations
    localStorage.setItem('fintrader_stocks', JSON.stringify(results));
    return results;
  }

  // Portfolio ────────────────────────────────────────────────────────────────

  async getHoldings() {
    await delay(200);
    return JSON.parse(localStorage.getItem('fintrader_holdings') || '[]');
  }

  async getBalance() {
    await delay(100);
    return parseFloat(localStorage.getItem('fintrader_balance') || '100000');
  }

  async getTradeHistory() {
    await delay(200);
    return JSON.parse(localStorage.getItem('fintrader_history') || '[]');
  }

  // Trade Execution ──────────────────────────────────────────────────────────

  async executeTrade(symbol, action, shares, price) {
    await delay(600);
    const balance = parseFloat(localStorage.getItem('fintrader_balance'));
    const holdings = JSON.parse(localStorage.getItem('fintrader_holdings') || '[]');
    const history  = JSON.parse(localStorage.getItem('fintrader_history')  || '[]');
    const totalCost = shares * price;

    if (action === 'BUY') {
      if (balance < totalCost) throw new Error('Insufficient balance to execute buy order');
      localStorage.setItem('fintrader_balance', (balance - totalCost).toFixed(2));
      const idx = holdings.findIndex(h => h.symbol === symbol);
      if (idx >= 0) {
        const existing = holdings[idx];
        const newShares = existing.shares + shares;
        const newAvg = ((existing.shares * existing.avgPrice) + totalCost) / newShares;
        holdings[idx] = { symbol, shares: newShares, avgPrice: parseFloat(newAvg.toFixed(2)) };
      } else {
        holdings.push({ symbol, shares, avgPrice: price });
      }
    } else if (action === 'SELL') {
      const idx = holdings.findIndex(h => h.symbol === symbol);
      if (idx < 0 || holdings[idx].shares < shares) {
        throw new Error('Insufficient shares to execute sell order');
      }
      localStorage.setItem('fintrader_balance', (balance + totalCost).toFixed(2));
      const remaining = holdings[idx].shares - shares;
      if (remaining > 0) holdings[idx] = { ...holdings[idx], shares: remaining };
      else holdings.splice(idx, 1);
    }

    const newTrade = {
      id: history.length + 1,
      symbol,
      type: action,
      shares,
      price,
      date: new Date().toISOString().split('T')[0],
    };
    history.unshift(newTrade);

    localStorage.setItem('fintrader_holdings', JSON.stringify(holdings));
    localStorage.setItem('fintrader_history',  JSON.stringify(history));

    return {
      success: true,
      balance: parseFloat(localStorage.getItem('fintrader_balance')),
      holdings,
      trade: newTrade,
    };
  }

  // Price History ────────────────────────────────────────────────────────────

  /**
   * Returns the full price history for a ticker from the backend as an array
   * of { date, price } objects (oldest → newest).
   */
  async getPriceHistory(symbol) {
    try {
      const { prices, dates } = await fetchTickerData(symbol);
      return buildPriceHistory(prices, dates);
    } catch (err) {
      console.error('getPriceHistory failed, falling back to mock', err);
      return [];
    }
  }

  // AI Recommendation ────────────────────────────────────────────────────────

  /**
   * Calls the FastAPI /predict endpoint with the current portfolio state
   * for the selected ticker.  Converts the raw DQN output into the shape
   * the UI expects: { action, confidence, reason }.
   */
  async getAIRecommendation(symbol) {
    try {
      // Build the state payload from stored data
      const balance  = parseFloat(localStorage.getItem('fintrader_balance') || '100000');
      const holdings = JSON.parse(localStorage.getItem('fintrader_holdings') || '[]');
      const stocks   = JSON.parse(localStorage.getItem('fintrader_stocks')   || '[]');

      const stock    = stocks.find(s => s.symbol === symbol);
      const holding  = holdings.find(h => h.symbol === symbol);
      const price    = stock?.price ?? 0;
      const sharesHeld = holding?.shares ?? 0;
      const netWorth = balance + holdings.reduce((sum, h) => {
        const s = stocks.find(x => x.symbol === h.symbol);
        return sum + h.shares * (s?.price ?? h.avgPrice);
      }, 0);

      const payload = { price, balance, shares: sharesHeld, net_worth: netWorth };
      const result  = await fetchJSON(`${BACKEND_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const actionMap = {
        HOLD: 'Holding position — model sees no strong directional signal.',
        BUY:  'Model signals a buying opportunity based on current portfolio state.',
        SELL: 'Model advises reducing exposure — consider taking profits or cutting losses.',
      };

      // Clamp confidence: raw Q-value → 0-100%
      const rawConf = result.confidence;
      const confidence = Math.min(100, Math.max(0, Math.round(Math.abs(rawConf) * 10)));

      return {
        action: result.action_text,
        confidence,
        reason: actionMap[result.action_text] ?? 'No signal available.',
      };
    } catch (err) {
      console.error('getAIRecommendation failed:', err);
      return {
        action: 'HOLD',
        confidence: 0,
        reason: 'Backend unavailable — defaulting to HOLD.',
      };
    }
  }

  // Account Reset ────────────────────────────────────────────────────────────

  async resetAccount() {
    await delay(400);
    localStorage.setItem('fintrader_balance',  '100000.00');
    localStorage.setItem('fintrader_holdings', JSON.stringify(initialHoldings));
    localStorage.setItem('fintrader_history',  JSON.stringify(initialTradeHistory));
    return { balance: 100000, holdings: initialHoldings, history: initialTradeHistory };
  }
}

export const api = new ApiService();
export default api;

