import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../../utils/helpers';
import { ArrowRight, Trash2 } from 'lucide-react';

export const HoldingsTable = () => {
  const { holdings, stockData, selectStock, resetAccount } = useTrading();
  const navigate = useNavigate();

  const handleTradeAction = (symbol) => {
    selectStock(symbol);
    navigate('/dashboard');
  };

  const totalValue = holdings.reduce((sum, h) => {
    const stock = stockData.find(s => s.symbol === h.symbol);
    const price = stock ? stock.price : h.avgPrice;
    return sum + (h.shares * price);
  }, 0);

  return (
    <div className="panel" style={{ gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Portfolio Asset Allocation</h2>
        <button 
          onClick={resetAccount} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-danger)', 
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Reset paper trading account"
        >
          <Trash2 size={14} />
          Reset Account
        </button>
      </div>

      {holdings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
          <p style={{ marginBottom: '16px' }}>Your portfolio is currently empty.</p>
          <button className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={() => navigate('/dashboard')}>
            Explore Market & Trade
          </button>
        </div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Shares Owned</th>
                  <th>Avg Price</th>
                  <th>Market Price</th>
                  <th>Current Value</th>
                  <th>Unrealized P&L</th>
                  <th>Portf %</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const stock = stockData.find(s => s.symbol === h.symbol);
                  const currentPrice = stock ? stock.price : h.avgPrice;
                  const holdingValue = h.shares * currentPrice;
                  const costBasis = h.shares * h.avgPrice;
                  const profitLoss = holdingValue - costBasis;
                  const returnPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;
                  const allocationPercent = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;

                  return (
                    <tr key={h.symbol}>
                      <td style={{ fontWeight: 700 }}>{h.symbol}</td>
                      <td className="num-align">{h.shares}</td>
                      <td className="num-align">{formatCurrency(h.avgPrice)}</td>
                      <td className="num-align">{formatCurrency(currentPrice)}</td>
                      <td className="num-align" style={{ fontWeight: 600 }}>{formatCurrency(holdingValue)}</td>
                      <td className={`num-align ${profitLoss >= 0 ? 'stock-change positive' : 'stock-change negative'}`}>
                        {formatCurrency(profitLoss)} ({profitLoss >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%)
                      </td>
                      <td className="num-align">{allocationPercent.toFixed(1)}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleTradeAction(h.symbol)}
                          style={{
                            background: 'rgba(35, 61, 77, 0.05)',
                            border: 'none',
                            color: 'var(--color-primary)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                            e.currentTarget.style.color = 'var(--color-white)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(35, 61, 77, 0.05)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                          }}
                        >
                          Trade <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{
            backgroundColor: 'rgba(35, 61, 77, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 700
          }}>
            <span>Total Holdings Valuation:</span>
            <span className="num-align" style={{ color: 'var(--color-secondary)', fontSize: '16px' }}>
              {formatCurrency(totalValue)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default HoldingsTable;
