import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { BrainCircuit, Info } from 'lucide-react';

export const AISuggestion = () => {
  const { selectedStock, aiSuggestion } = useTrading();

  if (!selectedStock || !aiSuggestion) {
    return (
      <div className="panel">
        <div className="panel-title">
          <BrainCircuit size={18} />
          AI Signals
        </div>
        <div className="skeleton" style={{ height: '80px' }}></div>
      </div>
    );
  }

  const { action, confidence, reason } = aiSuggestion;
  const actionLower = action.toLowerCase();

  return (
    <div className="panel">
      <div className="panel-title">
        <BrainCircuit size={18} color="var(--color-secondary)" />
        AI Signals (DQN-Agent)
      </div>

      <div className={`ai-recommendation-panel ${actionLower}`}>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            Recommended Action
          </div>
          <span className={`ai-badge ${actionLower}`}>{action}</span>
          <div className="ai-confidence">
            Confidence: <strong className="num-align" style={{ color: 'var(--color-primary)' }}>{confidence}%</strong>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', maxWidth: '60%', alignItems: 'flex-start' }}>
          <Info size={16} color="var(--color-primary-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '12px', color: 'var(--color-primary)', lineHeight: 1.4 }}>
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISuggestion;
