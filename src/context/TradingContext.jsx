import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const TradingContext = createContext(null);

export const TradingProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState(10000.00);
  const [holdings, setHoldings] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState(10000.00);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Fetch initial stocks, history, holdings, and balance
  const refreshPortfolio = useCallback(async (quiet = false) => {
    if (!isAuthenticated) return;
    if (!quiet) setLoading(true);
    try {
      const [fetchedStocks, fetchedHoldings, fetchedBalance, fetchedHistory] = await Promise.all([
        api.getStocks(),
        api.getHoldings(),
        api.getBalance(),
        api.getTradeHistory()
      ]);

      setStockData(fetchedStocks);
      setHoldings(fetchedHoldings);
      setBalance(fetchedBalance);
      setTradeHistory(fetchedHistory);

      // Default select the first stock if none is selected
      if (fetchedStocks.length > 0 && !selectedStock) {
        setSelectedStock(fetchedStocks[0]);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [isAuthenticated, selectedStock, showToast]);

  // Recalculate total portfolio value dynamically whenever holdings, balance, or stock prices update
  useEffect(() => {
    if (stockData.length === 0) return;
    
    const holdingsWorth = holdings.reduce((sum, h) => {
      const stock = stockData.find(s => s.symbol === h.symbol);
      const currentPrice = stock ? stock.price : h.avgPrice;
      return sum + (h.shares * currentPrice);
    }, 0);

    setPortfolioValue(parseFloat((balance + holdingsWorth).toFixed(2)));
  }, [holdings, balance, stockData]);

  // Trigger loading details when selected stock changes
  useEffect(() => {
    if (!selectedStock) return;

    const loadStockDetails = async () => {
      try {
        const [history, aiRec] = await Promise.all([
          api.getPriceHistory(selectedStock.symbol),
          api.getAIRecommendation(selectedStock.symbol)
        ]);
        setPriceHistory(history);
        setAiSuggestion(aiRec);
      } catch (err) {
        showToast('Error loading stock indicators', 'error');
      }
    };

    loadStockDetails();
  }, [selectedStock, showToast]);

  // Refresh automatically when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshPortfolio();
    }
  }, [isAuthenticated, refreshPortfolio]);

  const selectStockBySymbol = useCallback((symbol) => {
    const stock = stockData.find(s => s.symbol === symbol);
    if (stock) {
      setSelectedStock(stock);
    }
  }, [stockData]);

  const executeTrade = async (symbol, action, shares) => {
    if (!selectedStock) return;
    setTradeLoading(true);
    try {
      const price = selectedStock.price;
      const res = await api.executeTrade(symbol, action, shares, price);
      
      if (res.success) {
        // Optimistically update states from response
        setBalance(res.balance);
        setHoldings(res.holdings);
        
        // Refresh full portfolio in background to sync all changes
        await refreshPortfolio(true);
        
        showToast(`${action} order executed: ${shares} shares of ${symbol}`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    } finally {
      setTradeLoading(false);
    }
  };

  const resetAccount = async () => {
    setLoading(true);
    try {
      const res = await api.resetAccount();
      setBalance(res.balance);
      setHoldings(res.holdings);
      setTradeHistory(res.history);
      showToast('Paper account balance reset to $10,000.00', 'success');
      
      // Reselect default stock
      if (stockData.length > 0) {
        setSelectedStock(stockData[0]);
      }
    } catch (err) {
      showToast('Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TradingContext.Provider
      value={{
        balance,
        holdings,
        portfolioValue,
        stockData,
        selectedStock,
        priceHistory,
        aiSuggestion,
        tradeHistory,
        loading,
        tradeLoading,
        toastMessage,
        selectStock: selectStockBySymbol,
        executeTrade,
        resetAccount,
        clearToast,
        showToast,
        refreshPortfolio
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
export default TradingContext;
