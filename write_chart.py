code = r"""import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ChevronRight, ChevronsRight } from 'lucide-react';

// Days shown per timeframe window
const TIMEFRAME_DAYS = {
  '1W':  7,
  '1M':  30,
  '3M':  90,
  '6M':  180,
  'ALL': Infinity,
};

export const PriceChart = () => {
  const { selectedStock, priceHistory } = useTrading();
  const [timeframe, setTimeframe] = useState('1M');

  // viewEnd = index of the LAST visible data point in priceHistory[].
  // null  -> initialise to end of first window (start of history).
  // After that, skip buttons advance it forward toward totalLen-1 (the present).
  const [viewEnd, setViewEnd] = useState(null);
  const [hoverData, setHoverData] = useState(null);
  const containerRef = useRef(null);

  const totalLen = priceHistory?.length ?? 0;

  // Reset to the BEGINNING of history whenever stock or timeframe changes
  useEffect(() => {
    setHoverData(null);
    setViewEnd(null);
  }, [selectedStock, timeframe]);

  if (!selectedStock || !priceHistory || totalLen === 0) {
    return (
      <div className="panel" style={{ height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading stock chart...</p>
      </div>
    );
  }

  const windowDays = TIMEFRAME_DAYS[timeframe];

  // Resolve actual endIdx:
  //   null -> first window from the start of history
  //   else -> clamped to [0, totalLen-1]
  const initialEnd = windowDays === Infinity
    ? totalLen - 1
    : Math.min(windowDays - 1, totalLen - 1);

  const endIdx   = viewEnd === null ? initialEnd : Math.min(viewEnd, totalLen - 1);
  const startIdx = windowDays === Infinity ? 0 : Math.max(0, endIdx - windowDays + 1);
  const filteredHistory = priceHistory.slice(startIdx, endIdx + 1);

  // Navigation state
  const isAtLatest     = endIdx >= totalLen - 1;
  const canSkipForward = !isAtLatest;

  const skipForward = (days) => { setViewEnd(Math.min(endIdx + days, totalLen - 1)); setHoverData(null); };
  const jumpToNow   = ()     => { setViewEnd(totalLen - 1); setHoverData(null); };

  // Progress: what % of the full dataset have we reached?
  const progressPct = totalLen > 1 ? Math.round(((endIdx + 1) / totalLen) * 100) : 100;
  const startDate   = filteredHistory[0]?.date ?? '';
  const endDate     = filteredHistory[filteredHistory.length - 1]?.date ?? '';

  if (filteredHistory.length === 0) {
    return (
      <div className="panel" style={{ height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>No data for selected range.</p>
      </div>
    );
  }

  // SVG chart math
  const prices     = filteredHistory.map(d => d.price);
  const maxPrice   = Math.max(...prices);
  const minPrice   = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const svgWidth = 600, svgHeight = 200, padding = 20;

  const points = filteredHistory.map((item, i) => ({
    x: padding + (i / Math.max(filteredHistory.length - 1, 1)) * (svgWidth - padding * 2),
    y: svgHeight - padding - ((item.price - minPrice) / priceRange) * (svgHeight - padding * 2),
    price: item.price,
    date: item.date,
  }));

  const pathD = points.reduce(
    (acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, ''
  );
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`
    : '';

  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect    = e.currentTarget.getBoundingClientRect();
    const xSvgPos = padding + ((e.clientX - rect.left) / rect.width) * (svgWidth - padding * 2);
    let closest = points[0], minDist = Math.abs(points[0].x - xSvgPos);
    for (let i = 1; i < points.length; i++) {
      const d = Math.abs(points[i].x - xSvgPos);
      if (d < minDist) { minDist = d; closest = points[i]; }
    }
    setHoverData(closest);
  };

  const isUp        = selectedStock.change >= 0;
  const activePrice = hoverData
    ? hoverData.price
    : (filteredHistory[filteredHistory.length - 1]?.price ?? selectedStock.price);
  const activeDate  = hoverData ? hoverData.date : endDate;

  // Shared nav-button style helper
  const navBtn = (enabled, accent = 'var(--color-primary)') => ({
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '7px 14px',
    borderRadius: 'var(--radius-md)',
    border: `1.5px solid ${enabled ? accent : 'var(--color-bg)'}`,
    backgroundColor: enabled ? 'var(--color-surface)' : 'transparent',
    color: enabled ? accent : 'var(--color-text-muted)',
    fontSize: '12px', fontWeight: 700,
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.35,
    transition: 'background 0.15s ease, opacity 0.15s ease',
    whiteSpace: 'nowrap',
  });

  return (
    <div className="panel" ref={containerRef}>

      {/* Header */}
      <div className="chart-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
            {selectedStock.symbol} - {selectedStock.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="num-align" style={{ fontSize: '24px', fontWeight: 800 }}>
              {formatCurrency(activePrice)}
            </span>
            {!hoverData && (
              <span
                className={`num-align ${isUp ? 'stock-change positive' : 'stock-change negative'}`}
                style={{ fontSize: '14px', fontWeight: 700 }}
              >
                {isUp ? '+' : ''}{selectedStock.change}%
              </span>
            )}
          </div>

          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {hoverData ? formatDate(activeDate) : `${startDate}  to  ${endDate}`}
          </span>

          {/* Timeline progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: 'var(--color-bg)', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPct}%`, height: '100%', borderRadius: '2px',
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', minWidth: '32px' }}>
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="timeframe-selector">
          {Object.keys(TIMEFRAME_DAYS).map(tf => (
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

      {/* Chart */}
      <div className="chart-container">
        <svg
          className="svg-chart"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverData(null)}
          style={{ cursor: 'crosshair', display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   className="chart-gradient-stop-top"    />
              <stop offset="100%" className="chart-gradient-stop-bottom" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={padding}           x2={svgWidth - padding} y2={padding}           stroke="rgba(0,0,0,0.03)" />
          <line x1={padding} y1={svgHeight / 2}     x2={svgWidth - padding} y2={svgHeight / 2}     stroke="rgba(0,0,0,0.03)" />
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="rgba(0,0,0,0.03)" />
          {areaD && <path d={areaD} fill="url(#chartAreaGradient)" />}
          {pathD && <path d={pathD} className="chart-path" />}
          {hoverData && (
            <>
              <line
                x1={hoverData.x} y1={padding}
                x2={hoverData.x} y2={svgHeight - padding}
                stroke="var(--color-primary)" strokeDasharray="4,4" strokeWidth={1}
              />
              <circle
                cx={hoverData.x} cy={hoverData.y} r={5}
                fill="var(--color-secondary)" stroke="var(--color-white)" strokeWidth={2}
              />
            </>
          )}
        </svg>
      </div>

      {/* Skip-Forward Navigation
          The chart opens at the oldest available data.
          These buttons advance the view window forward in time toward the present. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginTop: '14px', paddingTop: '14px',
        borderTop: '1px solid var(--color-bg)', flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em',
          color: 'var(--color-text-muted)', textTransform: 'uppercase', marginRight: '2px',
        }}>
          Skip Forward
        </span>

        {[
          { label: '+1 Week',  days: 7   },
          { label: '+1 Month', days: 30  },
          { label: '+1 Year',  days: 365 },
        ].map(({ label, days }) => (
          <button
            key={label}
            style={navBtn(canSkipForward)}
            disabled={!canSkipForward}
            title={canSkipForward ? `Advance chart by ${label.replace('+', '').trim()}` : 'Already at the most recent data'}
            onClick={() => skipForward(days)}
          >
            {label}
            <ChevronRight size={13} />
          </button>
        ))}

        {/* Jump straight to the present */}
        <button
          style={{ ...navBtn(!isAtLatest, 'var(--color-secondary)'), marginLeft: 'auto' }}
          disabled={isAtLatest}
          title={isAtLatest ? 'Already at the most recent data' : 'Jump to the present'}
          onClick={jumpToNow}
        >
          <ChevronsRight size={14} />
          Now
        </button>
      </div>
    </div>
  );
};

export default PriceChart;
"""

with open('src/components/Dashboard/PriceChart.jsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(code)

print('Written successfully,', len(code.splitlines()), 'lines')
