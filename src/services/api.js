import { initialStocks, initialHoldings, initialTradeHistory, aiSuggestions, generatePriceHistory } from '../utils/mockData';

const USE_MOCK = true;

class MockApiService {
  constructor() {
    // Persistent state simulator using localStorage
    if (!localStorage.getItem('fintrader_stocks')) {
      localStorage.setItem('fintrader_stocks', JSON.stringify(initialStocks));
    }
    if (!localStorage.getItem('fintrader_holdings')) {
      localStorage.setItem('fintrader_holdings', JSON.stringify(initialHoldings));
    }
    if (!localStorage.getItem('fintrader_history')) {
      localStorage.setItem('fintrader_history', JSON.stringify(initialTradeHistory));
    }
    if (!localStorage.getItem('fintrader_balance')) {
      localStorage.setItem('fintrader_balance', '10000.00'); // Starting virtual balance
    }
    if (!localStorage.getItem('fintrader_users')) {
      localStorage.setItem('fintrader_users', JSON.stringify([
        { username: 'admin', password: 'password123', name: 'Practice Trader' }
      ]));
    }
  }

  // Delay simulation helper to feel like a real API
  _delay(ms = 600) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(username, password) {
    await this._delay();
    const users = JSON.parse(localStorage.getItem('fintrader_users'));
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    return {
      username: user.username,
      name: user.name || 'Trader',
      token: 'mock-jwt-token-xyz'
    };
  }

  async register(username, password, name = 'Practice Trader') {
    await this._delay();
    const users = JSON.parse(localStorage.getItem('fintrader_users'));
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (exists) {
      throw new Error('Username already exists');
    }
    
    const newUser = { username, password, name };
    users.push(newUser);
    localStorage.setItem('fintrader_users', JSON.stringify(users));
    
    return {
      username: newUser.username,
      name: newUser.name,
      token: 'mock-jwt-token-xyz'
    };
  }

  async getStocks() {
    await this._delay(400);
    return JSON.parse(localStorage.getItem('fintrader_stocks'));
  }

  async getHoldings() {
    await this._delay(300);
    return JSON.parse(localStorage.getItem('fintrader_holdings'));
  }

  async getBalance() {
    await this._delay(200);
    return parseFloat(localStorage.getItem('fintrader_balance'));
  }

  async getTradeHistory() {
    await this._delay(300);
    return JSON.parse(localStorage.getItem('fintrader_history'));
  }

  async executeTrade(symbol, action, shares, price) {
    await this._delay(800);
    const balance = parseFloat(localStorage.getItem('fintrader_balance'));
    const holdings = JSON.parse(localStorage.getItem('fintrader_holdings'));
    const history = JSON.parse(localStorage.getItem('fintrader_history'));
    const totalCost = shares * price;

    if (action === 'BUY') {
      if (balance < totalCost) {
        throw new Error('Insufficient balance to execute buy order');
      }
      
      // Update balance
      const newBalance = (balance - totalCost).toFixed(2);
      localStorage.setItem('fintrader_balance', newBalance);

      // Update holdings
      const holdingIndex = holdings.findIndex(h => h.symbol === symbol);
      if (holdingIndex >= 0) {
        const existing = holdings[holdingIndex];
        const newShares = existing.shares + shares;
        const newAvg = ((existing.shares * existing.avgPrice) + totalCost) / newShares;
        holdings[holdingIndex] = {
          symbol,
          shares: newShares,
          avgPrice: parseFloat(newAvg.toFixed(2))
        };
      } else {
        holdings.push({
          symbol,
          shares,
          avgPrice: price
        });
      }
    } else if (action === 'SELL') {
      const holdingIndex = holdings.findIndex(h => h.symbol === symbol);
      if (holdingIndex < 0 || holdings[holdingIndex].shares < shares) {
        throw new Error('Insufficient shares to execute sell order');
      }

      // Update balance
      const newBalance = (balance + totalCost).toFixed(2);
      localStorage.setItem('fintrader_balance', newBalance);

      // Update holdings
      const existing = holdings[holdingIndex];
      const remainingShares = existing.shares - shares;
      if (remainingShares > 0) {
        holdings[holdingIndex] = {
          ...existing,
          shares: remainingShares
        };
      } else {
        holdings.splice(holdingIndex, 1);
      }
    }

    // Add to history log
    const newTrade = {
      id: history.length + 1,
      symbol,
      type: action,
      shares,
      price,
      date: new Date().toISOString().split('T')[0]
    };
    history.unshift(newTrade); // Newest first

    localStorage.setItem('fintrader_holdings', JSON.stringify(holdings));
    localStorage.setItem('fintrader_history', JSON.stringify(history));

    return {
      success: true,
      balance: parseFloat(localStorage.getItem('fintrader_balance')),
      holdings,
      trade: newTrade
    };
  }

  async getAIRecommendation(symbol) {
    await this._delay(250);
    return aiSuggestions[symbol] || { action: 'HOLD', confidence: 50, reason: 'Insufficient analysis data.' };
  }

  async getPriceHistory(symbol) {
    await this._delay(400);
    const stocks = JSON.parse(localStorage.getItem('fintrader_stocks'));
    const stock = stocks.find(s => s.symbol === symbol);
    const basePrice = stock ? stock.price : 100;
    return generatePriceHistory(basePrice);
  }

  async resetAccount() {
    await this._delay(500);
    localStorage.setItem('fintrader_balance', '10000.00');
    localStorage.setItem('fintrader_holdings', JSON.stringify(initialHoldings));
    localStorage.setItem('fintrader_history', JSON.stringify(initialTradeHistory));
    return {
      balance: 10000.00,
      holdings: initialHoldings,
      history: initialTradeHistory
    };
  }
}

class RealApiService {
  constructor() {
    this.baseUrl = '/api/v1';
  }

  async login(username, password) {
    throw new Error('Real backend API service not implemented yet');
  }

  async register(username, password, name) {
    throw new Error('Real backend API service not implemented yet');
  }

  async getStocks() {
    throw new Error('Real backend API service not implemented yet');
  }

  async getHoldings() {
    throw new Error('Real backend API service not implemented yet');
  }

  async getBalance() {
    throw new Error('Real backend API service not implemented yet');
  }

  async getTradeHistory() {
    throw new Error('Real backend API service not implemented yet');
  }

  async executeTrade(symbol, action, shares, price) {
    throw new Error('Real backend API service not implemented yet');
  }

  async getAIRecommendation(symbol) {
    throw new Error('Real backend API service not implemented yet');
  }

  async getPriceHistory(symbol) {
    throw new Error('Real backend API service not implemented yet');
  }

  async resetAccount() {
    throw new Error('Real backend API service not implemented yet');
  }
}

export const api = USE_MOCK ? new MockApiService() : new RealApiService();
export default api;
