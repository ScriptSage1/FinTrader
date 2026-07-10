import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { AreaChart } from 'lucide-react';

export const PriceChart = () => {
  const { selectedStock, priceHistory } = useTrading();
  const [timeframe, setTimeframe] = useState('1M'); // '1W', '1M', '3M'
  const [hoverData, setHoverData] = useState(null);
  const containerRef = useRef(null);

  // Filter history based on timeframe
  const getFilteredHistory = () => {
    if (!priceHistory || priceHistory.length === 0) return [];
    if (timeframe === '1W') return priceHistory.slice(-7);
    if (timeframe === '1M') return priceHistory.slice(-30);
    return priceHistory;
  };

  const filteredHistory = getFilteredHistory();

  // Reset hover state when stock changes
  useEffect(() => {
    setHoverData(null);
  }, [selectedStock, timeframe]);

  if (!selectedStock || filteredHistory.length === 0) {
    return (
      <div className="panel" style={{ height: '320px', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading stock chart...</p>
      </div>
    );
  }

  // Calculate coordinates for SVG plotting
  const prices = filteredHistory.map(d => d.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // SVG parameters
  const svgWidth = 600;
  const svgHeight = 200;
  const padding = 20;

  const points = filteredHistory.map((item, index) => {
    const x = padding + (index / (filteredHistory.length - 1)) * (svgWidth - padding * 2);
    // Invert Y axis for SVGs
    const y = svgHeight - padding - ((item.price - minPrice) / priceRange) * (svgHeight - padding * 2);
    return { x, y, price: item.price, date: item.date };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Generate path for area fill
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`
    : '';

  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const xClient = e.clientX - rect.left;
    const xSvgRatio = xClient / rect.width;
    const xSvgPos = padding + xSvgRatio * (svgWidth - padding * 2);

    // Find the closest point
    let closestPoint = points[0];
    let minDistance = Math.abs(points[0].x - xSvgPos);

    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(points[i].x - xSvgPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = points[i];
      }
    }

    setHoverData(closestPoint);
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const activePrice = hoverData ? hoverData.price : selectedStock.price;
  const activeDate = hoverData ? hoverData.date : filteredHistory[filteredHistory.length - 1]?.date;
  const isUp = selectedStock.change >= 0;

  return (
    <div className="panel" ref={containerRef}>
      <div className="chart-header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedStock.symbol} - {selectedStock.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
            <span className="num-align" style={{ fontSize: '24px', fontWeight: '800' }}>
              {formatCurrency(activePrice)}
            </span>
            <span className={`num-align ${isUp ? 'stock-change positive' : 'stock-change negative'}`} style={{ fontSize: '14px', fontWeight: '700' }}>
              {hoverData ? '' : `${isUp ? '+' : ''}${selectedStock.change}%`}
            </span>
          </div>
          {hoverData && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              📅 {formatDate(activeDate)}
            </span>
          )}
        </div>

        <div className="timeframe-selector">
          {['1W', '1M', '3M'].map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <svg 
          className="svg-chart" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'crosshair', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="chart-gradient-stop-top" />
              <stop offset="100%" className="chart-gradient-stop-bottom" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="rgba(0,0,0,0.03)" />
          <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="rgba(0,0,0,0.03)" />
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="rgba(0,0,0,0.03)" />

          {/* Area under the curve */}
          {areaD && <path d={areaD} fill="url(#chartAreaGradient)" />}

          {/* Trend Line */}
          {pathD && <path d={pathD} className="chart-path" />}

          {/* Interactive Hover Crosshair */}
          {hoverData && (
            <>
              {/* Vertical crosshair line */}
              <line 
                x1={hoverData.x} 
                y1={padding} 
                x2={hoverData.x} 
                y2={svgHeight - padding} 
                stroke="var(--color-primary)" 
                strokeDasharray="4,4"
                strokeWidth={1}
              />
              {/* Active data node circle */}
              <circle 
                cx={hoverData.x} 
                cy={hoverData.y} 
                r={5} 
                fill="var(--color-secondary)" 
                stroke="var(--color-white)" 
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default PriceChart;
