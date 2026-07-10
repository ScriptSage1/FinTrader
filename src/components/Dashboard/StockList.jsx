import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Search, Sparkles } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

export const StockList = () => {
  const { stockData, selectedStock, selectStock } = useTrading();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = stockData.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="panel" style={{ flex: 'none', height: '100%' }}>
      <div className="panel-title">
        <Sparkles size={18} color="var(--color-secondary)" />
        Market Discovery
      </div>

      <div className="stock-search">
        <Search size={16} />
        <input 
          type="text" 
          placeholder="Search ticker or name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="stock-list-container">
        {filteredStocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            No matching tickers found.
          </div>
        ) : (
          filteredStocks.map(stock => {
            const isSelected = selectedStock?.symbol === stock.symbol;
            return (
              <div 
                key={stock.symbol}
                className={`stock-row ${isSelected ? 'selected' : ''}`}
                onClick={() => selectStock(stock.symbol)}
              >
                <div className="stock-info">
                  <span className="stock-symbol">{stock.symbol}</span>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-price-col">
                  <div className="stock-price num-align">{formatCurrency(stock.price)}</div>
                  <div className={`stock-change num-align ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercentage(stock.change)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StockList;
