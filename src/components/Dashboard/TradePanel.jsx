import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { formatCurrency } from '../../utils/helpers';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const TradePanel = () => {
  const { selectedStock, balance, holdings, executeTrade, tradeLoading } = useTrading();
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' or 'SELL'
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  // Reset quantity and error when stock or type changes
  useEffect(() => {
    setQuantity(1);
    setError('');
  }, [selectedStock, tradeType]);

  if (!selectedStock) return null;

  const currentHolding = holdings.find(h => h.symbol === selectedStock.symbol);
  const sharesOwned = currentHolding ? currentHolding.shares : 0;
  const price = selectedStock.price;
  const totalCost = quantity * price;

  // Max shares calculation
  const handleMax = () => {
    if (tradeType === 'BUY') {
      const maxAffordable = Math.floor(balance / price);
      setQuantity(maxAffordable > 0 ? maxAffordable : 1);
    } else if (tradeType === 'SELL') {
      setQuantity(sharesOwned > 0 ? sharesOwned : 1);
    } else {
      setQuantity(1);
    }
  };

  const handleQuantityChange = (val) => {
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty <= 0) {
      setQuantity(1);
      return;
    }
    setQuantity(qty);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('Please specify a positive quantity.');
      return;
    }

    if (tradeType === 'BUY' && totalCost > balance) {
      setError('Insufficient balance to complete purchase.');
      return;
    }

    if (tradeType === 'SELL' && quantity > sharesOwned) {
      setError(`Insufficient shares. You only own ${sharesOwned} shares.`);
      return;
    }

    setShowConfirm(true);
  };

  const confirmTrade = async () => {
    setShowConfirm(false);
    try {
      await executeTrade(selectedStock.symbol, tradeType, quantity);
      setQuantity(1);
    } catch (err) {
      setError(err.message || 'Transaction failed');
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <ShieldCheck size={18} color="var(--color-secondary)" />
        Trade Terminal
      </div>

      <div className="trade-toggle">
        <button
          className={`trade-toggle-btn buy ${tradeType === 'BUY' ? 'active' : ''}`}
          onClick={() => setTradeType('BUY')}
        >
          BUY
        </button>
        <button
          className={`trade-toggle-btn sell ${tradeType === 'SELL' ? 'active' : ''}`}
          onClick={() => setTradeType('SELL')}
        >
          SELL
        </button>
        <button
          className={`trade-toggle-btn hold ${tradeType === 'HOLD' ? 'active' : ''}`}
          onClick={() => setTradeType('HOLD')}
          style={{
            backgroundColor: tradeType === 'HOLD' ? 'var(--color-primary)' : 'transparent',
            color: tradeType === 'HOLD' ? 'var(--color-white)' : 'var(--color-text-muted)'
          }}
        >
          HOLD
        </button>
      </div>

      <form onSubmit={handleSubmit} className="trade-form">
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '12px',
            fontWeight: 600
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          <span>
            {tradeType === 'BUY' ? 'Buying Power:' : tradeType === 'SELL' ? 'Holdings Available:' : 'Current Position:'}
          </span>
          <span className="num-align" style={{ color: 'var(--color-primary)' }}>
            {tradeType === 'BUY' ? formatCurrency(balance) : `${sharesOwned} Shares`}
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="trade-quantity">Quantity</label>
          <div className="qty-input-wrapper">
            <input
              id="trade-quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              disabled={tradeLoading}
            />
            <button
              type="button"
              className="btn-max"
              onClick={handleMax}
              disabled={tradeLoading || tradeType === 'HOLD'}
            >
              MAX
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderTop: '1px solid var(--color-bg)' }}>
          <div className="trade-summary-row">
            <span>Price per Share:</span>
            <span className="trade-summary-val num-align">{formatCurrency(price)}</span>
          </div>
          <div className="trade-summary-row">
            <span>
              {tradeType === 'HOLD' ? 'Simulation Value:' : `Estimated ${tradeType === 'BUY' ? 'Cost' : 'Proceeds'}:`}
            </span>
            <span className="trade-summary-val num-align" style={{ fontSize: '15px', color: 'var(--color-secondary)' }}>
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ 
            backgroundColor: tradeType === 'BUY' ? 'var(--color-success)' : tradeType === 'SELL' ? 'var(--color-danger)' : 'var(--color-primary)' 
          }}
          disabled={tradeLoading || (tradeType === 'SELL' && sharesOwned === 0) || (tradeType === 'BUY' && balance < price)}
        >
          {tradeLoading ? 'Processing...' : `Execute ${tradeType} for ${selectedStock.symbol}`}
        </button>
      </form>

      {/* Confirmation Dialog Pattern */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Confirm Simulation Order</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              You are placing a mock <strong>{tradeType}</strong> order for <strong>{quantity}</strong> shares of{' '}
              <strong>{selectedStock.symbol}</strong> at <strong>{formatCurrency(price)}</strong> each.
            </p>
            <div style={{ padding: '10px 0', borderTop: '1px solid var(--color-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Estimated Value:</span>
                <span className="num-align" style={{ fontWeight: 700 }}>{formatCurrency(totalCost)}</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn-outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={confirmTrade}
                style={{ 
                  flex: 1, 
                  backgroundColor: tradeType === 'BUY' ? 'var(--color-success)' : tradeType === 'SELL' ? 'var(--color-danger)' : 'var(--color-primary)' 
                }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradePanel;
