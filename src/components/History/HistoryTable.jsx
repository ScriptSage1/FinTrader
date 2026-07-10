import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Filter, Search } from 'lucide-react';

export const HistoryTable = () => {
  const { tradeHistory } = useTrading();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'BUY', 'SELL'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = tradeHistory.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || trade.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="panel" style={{ gap: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Simulated Order History</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stock-search" style={{ margin: 0, minWidth: '240px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--color-primary-light)" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #D1D5DB',
              outline: 'none',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--color-white)'
            }}
          >
            <option value="ALL">All Types</option>
            <option value="BUY">Buys Only</option>
            <option value="SELL">Sells Only</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          No recorded orders matching criteria.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trade Date</th>
                <th>Ticker Symbol</th>
                <th>Transaction Type</th>
                <th>Quantity</th>
                <th>Price per Share</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(trade => {
                const totalVal = trade.shares * trade.price;
                return (
                  <tr key={trade.id}>
                    <td>{formatDate(trade.date)}</td>
                    <td style={{ fontWeight: 700 }}>{trade.symbol}</td>
                    <td>
                      <span
                        className="num-align"
                        style={{
                          fontWeight: 700,
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: 'var(--color-white)',
                          backgroundColor: trade.type === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)'
                        }}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="num-align">{trade.shares}</td>
                    <td className="num-align">{formatCurrency(trade.price)}</td>
                    <td className="num-align" style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(totalVal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
