// Real NSE tickers served by the FastAPI backend
// Tickers map to CSV files in backend/data/
export const BACKEND_TICKERS = [
  { symbol: 'EQUITASBNK.NS', name: 'Equitas Small Finance Bank' },
  { symbol: 'GMRAIRPORT.NS', name: 'GMR Airports Infrastructure' },
  { symbol: 'HGINFRA.NS',    name: 'H.G. Infra Engineering' },
  { symbol: 'MOSCHIP.NS',    name: 'MosChip Technologies' },
  { symbol: 'UJJIVANSFB.NS', name: 'Ujjivan Small Finance Bank' },
];

// Placeholder initial stocks (prices will be replaced by live backend data on load)
export const initialStocks = BACKEND_TICKERS.map(t => ({
  symbol: t.symbol,
  name: t.name,
  price: 0,
  change: 0,
}));

// Initial user holdings (start empty — prices come from the backend)
export const initialHoldings = [];

// Initial trade history log
export const initialTradeHistory = [];

// AI Suggestions fallback (used only if backend call fails)
export const aiSuggestions = {};

// Generates price history from a raw prices array + optional dates array returned by the backend
export const buildPriceHistory = (prices, dates = []) => {
  if (!prices || prices.length === 0) return [];
  const history = [];
  const now = new Date();
  for (let i = 0; i < prices.length; i++) {
    // Use real date if available, otherwise compute synthetic offset date
    let dateStr;
    if (dates && dates[i]) {
      dateStr = dates[i];
    } else {
      const d = new Date(now);
      d.setDate(now.getDate() - (prices.length - 1 - i));
      dateStr = d.toISOString().split('T')[0];
    }
    history.push({ date: dateStr, price: parseFloat(prices[i]) });
  }
  return history;
};

// Legacy helper kept for compatibility
export const generatePriceHistory = (basePrice, days = 30) => {
  const history = [];
  let currentPrice = basePrice;
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const changePercent = (Math.random() * 6 - 3) / 100;
    currentPrice = parseFloat((currentPrice * (1 + changePercent)).toFixed(2));
    history.push({ date: dateStr, price: currentPrice });
  }
  return history;
};
