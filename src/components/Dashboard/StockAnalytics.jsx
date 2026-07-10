import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { formatCurrency } from '../../utils/helpers';
import { BarChart3, Users } from 'lucide-react';

export const StockAnalytics = () => {
  const { selectedStock } = useTrading();

  if (!selectedStock) return null;

  const price = selectedStock.price;
  
  // Calculate mock level 2 book based on selected stock price
  const bids = [
    { price: price - 0.04, size: 1400 },
    { price: price - 0.12, size: 2500 },
    { price: price - 0.25, size: 4200 }
  ];

  const asks = [
    { price: price + 0.05, size: 850 },
    { price: price + 0.14, size: 1900 },
    { price: price + 0.28, size: 3100 }
  ];

  const totalBidSize = bids.reduce((sum, b) => sum + b.size, 0);
  const totalAskSize = asks.reduce((sum, a) => sum + a.size, 0);
  const totalDepth = totalBidSize + totalAskSize;
  const buyerPercent = Math.round((totalBidSize / totalDepth) * 100);
  const sellerPercent = 100 - buyerPercent;

  // Calculate mock corporate valuation metrics
  const marketCapValue = price * (selectedStock.symbol === 'NVDA' ? 3.2 : selectedStock.symbol === 'AAPL' ? 15.2 : 8.5);
  const marketCapFormatted = selectedStock.symbol === 'AAPL' || selectedStock.symbol === 'MSFT' || selectedStock.symbol === 'NVDA'
    ? `$${(marketCapValue / 10).toFixed(2)}T`
    : `$${marketCapValue.toFixed(2)}B`;

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="panel-title">
        <BarChart3 size={18} color="var(--color-secondary)" />
        Advanced Stock Analytics
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Side: Mock Order Book (Market Depth) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            <Users size={14} />
            Market Depth (Simulated L2)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Asks (Sellers) in descending order */}
            {asks.reverse().map((ask, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="num-align" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{formatCurrency(ask.price)}</span>
                <span className="num-align" style={{ color: 'var(--color-text-muted)' }}>{ask.size}</span>
              </div>
            ))}

            {/* Spread Indicator */}
            <div style={{ 
              borderTop: '1px solid var(--color-bg)', 
              borderBottom: '1px solid var(--color-bg)', 
              padding: '2px 0', 
              textAlign: 'center', 
              fontSize: '10px', 
              color: 'var(--color-text-muted)',
              fontWeight: 700,
              margin: '2px 0'
            }}>
              SPREAD: {formatCurrency(asks[0].price - bids[0].price)}
            </div>

            {/* Bids (Buyers) */}
            {bids.map((bid, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="num-align" style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatCurrency(bid.price)}</span>
                <span className="num-align" style={{ color: 'var(--color-text-muted)' }}>{bid.size}</span>
              </div>
            ))}
          </div>

          {/* Bid/Ask strength bar */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-success)' }}>{buyerPercent}% Bids</span>
              <span style={{ color: 'var(--color-danger)' }}>{sellerPercent}% Asks</span>
            </div>
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
              <div style={{ width: `${buyerPercent}%`, backgroundColor: 'var(--color-success)' }}></div>
              <div style={{ width: `${sellerPercent}%`, backgroundColor: 'var(--color-danger)' }}></div>
            </div>
          </div>
        </div>

        {/* Right Side: Key Valuation Metrics */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Key Metrics
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--color-bg)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Market Cap</span>
              <strong className="num-align">{marketCapFormatted}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--color-bg)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>52W High</span>
              <strong className="num-align">{formatCurrency(price * 1.25)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--color-bg)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>52W Low</span>
              <strong className="num-align">{formatCurrency(price * 0.74)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--color-bg)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>P/E Ratio</span>
              <strong className="num-align">{(15 + (price % 20)).toFixed(1)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalytics;
