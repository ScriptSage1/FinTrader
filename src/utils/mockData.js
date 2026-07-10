// Available stocks in simulator
export const initialStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.20, change: 2.5 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.75, change: -1.2 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.30, change: 3.8 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 375.50, change: 0.8 },
  { symbol: 'AMZN', name: 'Amazon Inc.', price: 145.90, change: -0.5 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 820.10, change: 4.2 }
];

// Initial user holdings
export const initialHoldings = [
  { symbol: 'AAPL', shares: 10, avgPrice: 175.50 },
  { symbol: 'GOOGL', shares: 5, avgPrice: 138.00 },
  { symbol: 'TSLA', shares: 8, avgPrice: 240.00 }
];

// Initial trade history log
export const initialTradeHistory = [
  { id: 1, symbol: 'AAPL', type: 'BUY', shares: 5, price: 175.50, date: '2026-07-08' },
  { id: 2, symbol: 'TSLA', type: 'SELL', shares: 3, price: 240.00, date: '2026-07-09' }
];

// AI Recommendations with confidence scores and reasoning
export const aiSuggestions = {
  'AAPL': { action: 'BUY', confidence: 82, reason: 'Bullish trend with strong support at $180.' },
  'GOOGL': { action: 'HOLD', confidence: 65, reason: 'Consolidation phase; wait for breakout.' },
  'TSLA': { action: 'SELL', confidence: 70, reason: 'Overbought conditions on RSI indicators.' },
  'MSFT': { action: 'BUY', confidence: 78, reason: 'Strong quarterly growth projections.' },
  'AMZN': { action: 'HOLD', confidence: 58, reason: 'Market fluctuation; narrow trading range.' },
  'NVDA': { action: 'BUY', confidence: 89, reason: 'Heavy AI infrastructure demand tailwinds.' }
};

// Generates 30 days of price history using a random walk
export const generatePriceHistory = (basePrice, days = 30) => {
  const history = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random percent change between -3% and +3%
    const changePercent = (Math.random() * 6 - 3) / 100;
    currentPrice = parseFloat((currentPrice * (1 + changePercent)).toFixed(2));
    
    history.push({
      date: dateStr,
      price: currentPrice
    });
  }
  
  return history;
};
