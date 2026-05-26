import { useState } from 'react';
import SegmentChart, { ChartLegend } from '../components/SegmentChart.jsx';

// Generic metric tab — used by Cases, Orders, Doors, Velocity, Revenue tabs.
// Renders the main chart with bar/line toggle. (The v11 "segment breakdown"
// mini-row sparklines below the chart could be added later as a follow-up if
// you miss them — they're nice to have but the main chart carries the story.)

function sliceSrc(src, si, ei) {
  const out = {};
  Object.keys(src || {}).forEach((s) => { out[s] = (src[s] || []).slice(si, ei + 1); });
  return out;
}

export default function MetricTab({
  data, activeSegs, si, ei,
  metric,       // 'cases' | 'orders' | 'doors' | 'velocity' | 'revenue'
  title,        // display title
  isMoney = false,
  isVelocity = false,
  defaultType = 'bar',
}) {
  const [type, setType] = useState(isVelocity ? 'line' : defaultType);
  const src = data[metric];
  if (!src) return <div className="card">No data for {metric}.</div>;

  const months = data.months.slice(si, ei + 1);
  const visibleSegs = activeSegs.filter(
    (s) => src[s] && src[s].slice(si, ei + 1).some((v) => v > 0)
  );

  return (
    <div className="card">
      <div className="card-hdr">
        <div className="ctitle">{title}</div>
        {!isVelocity && (
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <button className={'ct-tgl' + (type === 'bar' ? ' on' : '')} onClick={() => setType('bar')}>Bar</button>
            <button className={'ct-tgl' + (type === 'line' ? ' on' : '')} onClick={() => setType('line')}>Line</button>
          </div>
        )}
      </div>
      <ChartLegend activeSegs={visibleSegs} />
      <SegmentChart
        src={sliceSrc(src, si, ei)}
        months={months}
        activeSegs={activeSegs}
        type={type}
        isMoney={isMoney}
        isVelocity={isVelocity}
      />
    </div>
  );
}
