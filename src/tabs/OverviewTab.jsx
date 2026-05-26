import { useState } from 'react';
import SegmentChart, { ChartLegend } from '../components/SegmentChart.jsx';
import DtcVsB2BChart from '../components/DtcVsB2BChart.jsx';

// Overview tab. Shows the four "executive summary" charts in v11 order:
//   1. Cases by segment
//   2. Gross Revenue by segment
//   3. DTC vs B2B (stacked) — uses both DTC raw + filtered B2B sum
//   4. Doors by segment
//
// Each card has its own Bar / Line toggle (kept independent so users can
// look at trends as lines without losing the stacked totals on others).

function ChartCard({ title, children, type, setType }) {
  return (
    <div className="card">
      <div className="card-hdr">
        <div className="ctitle">{title}</div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button className={'ct-tgl' + (type === 'bar' ? ' on' : '')} onClick={() => setType('bar')}>Bar</button>
          <button className={'ct-tgl' + (type === 'line' ? ' on' : '')} onClick={() => setType('line')}>Line</button>
        </div>
      </div>
      {children}
    </div>
  );
}

function sliceSrc(src, si, ei) {
  // Slice every segment's array to the visible window
  const out = {};
  Object.keys(src || {}).forEach((s) => { out[s] = (src[s] || []).slice(si, ei + 1); });
  return out;
}

export default function OverviewTab({ data, activeSegs, si, ei }) {
  const [casesType, setCasesType] = useState('bar');
  const [revType, setRevType] = useState('bar');
  const [dtcType, setDtcType] = useState('bar');
  const [doorsType, setDoorsType] = useState('bar');

  const months = data.months.slice(si, ei + 1);
  const visibleSegs = activeSegs.filter(
    (s) => data.cases[s] && data.cases[s].slice(si, ei + 1).some((v) => v > 0)
  );

  return (
    <>
      <ChartCard title="Cases by segment" type={casesType} setType={setCasesType}>
        <ChartLegend activeSegs={visibleSegs} />
        <SegmentChart
          src={sliceSrc(data.cases, si, ei)}
          months={months}
          activeSegs={activeSegs}
          type={casesType}
        />
      </ChartCard>

      {data.revenue && (
        <ChartCard title="Gross Revenue by Segment" type={revType} setType={setRevType}>
          <ChartLegend activeSegs={activeSegs.filter(
            (s) => data.revenue[s] && data.revenue[s].slice(si, ei + 1).some((v) => v > 0)
          )} />
          <SegmentChart
            src={sliceSrc(data.revenue, si, ei)}
            months={months}
            activeSegs={activeSegs}
            type={revType}
            isMoney
          />
        </ChartCard>
      )}

      <ChartCard title="DTC vs B2B Cases" type={dtcType} setType={setDtcType}>
        <DtcVsB2BChart data={data} activeSegs={activeSegs} si={si} ei={ei} type={dtcType} />
      </ChartCard>

      <ChartCard title="Store Doors by Segment" type={doorsType} setType={setDoorsType}>
        <ChartLegend activeSegs={activeSegs.filter(
          (s) => data.doors[s] && data.doors[s].slice(si, ei + 1).some((v) => v > 0)
        )} />
        <SegmentChart
          src={sliceSrc(data.doors, si, ei)}
          months={months}
          activeSegs={activeSegs}
          type={doorsType}
          height={220}
        />
      </ChartCard>
    </>
  );
}
