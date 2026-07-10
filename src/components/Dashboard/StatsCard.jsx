import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { Trophy, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { calculateWinRate } from '../../utils/helpers';

export const StatsCard = () => {
  const { tradeHistory, holdings } = useTrading();
  
  const totalTrades = tradeHistory.length;
  const winRate = calculateWinRate(tradeHistory);
  const distinctHoldings = holdings.length;

  return (
    <div className="panel">
      <div className="panel-title">
        <BarChart3 size={18} color="var(--color-secondary)" />
        Simulated Statistics
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{
          backgroundColor: 'rgba(35, 61, 77, 0.03)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Win Rate</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={16} color="var(--color-secondary)" />
            <span className="num-align" style={{ fontSize: '18px', fontWeight: 800 }}>{winRate}%</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(35, 61, 77, 0.03)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Orders</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} color="var(--color-primary)" />
            <span className="num-align" style={{ fontSize: '18px', fontWeight: 800 }}>{totalTrades}</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(35, 61, 77, 0.03)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          gridColumn: 'span 2'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Portfolio Diversification</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} color="var(--color-success)" />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              {distinctHoldings} Distinct Asset{distinctHoldings !== 1 ? 's' : ''} Owned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
