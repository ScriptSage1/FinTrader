import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { Wallet, Briefcase, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export const BalanceChip = () => {
  const { balance, portfolioValue, holdings } = useTrading();
  
  // Calculate unrealized P&L or return for display
  const holdingsCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
  const netReturn = portfolioValue - 10000; // Compared to initial $10k
  const netReturnPercent = (netReturn / 10000) * 100;

  return (
    <div className="balance-card-grid">
      <div className="summary-card">
        <div className="summary-card-icon">
          <Wallet size={20} />
        </div>
        <div className="summary-card-data">
          <span className="summary-card-label">Available Cash</span>
          <span className="summary-card-value num-align">{formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="summary-card accent">
        <div className="summary-card-icon">
          <Briefcase size={20} />
        </div>
        <div className="summary-card-data">
          <span className="summary-card-label">Total Net Worth</span>
          <span className="summary-card-value num-align">{formatCurrency(portfolioValue)}</span>
        </div>
      </div>

      <div className="summary-card" style={{ borderLeftColor: netReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
        <div className="summary-card-icon" style={{ color: netReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)', backgroundColor: netReturn >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
          <TrendingUp size={20} />
        </div>
        <div className="summary-card-data">
          <span className="summary-card-label">Simulated Return</span>
          <span className={`summary-card-value num-align ${netReturn >= 0 ? 'stock-change positive' : 'stock-change negative'}`} style={{ fontSize: '18px' }}>
            {formatCurrency(netReturn)} ({netReturnPercent >= 0 ? '+' : ''}{netReturnPercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BalanceChip;
