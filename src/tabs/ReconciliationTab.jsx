import { useEffect, useMemo, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { fmtMoney, fmtMoneyFull } from '../lib/format.js';

Chart.register(...registerables);

// Reconciliation tab — compares Data-Summary REVENUES.TOTAL to QBO non-DTC
// gross (accounts 4102 + 4103 + 4104) month by month.

const RECON_GREEN_PCT = 0.5;
const RECON_GREEN_ABS = 100;
const RECON_YELLOW_PCT = 2;
const RECON_YELLOW_ABS = 500;

// Compute one row per month in window that has both DS + QBO data.
// Note: DS sum ignores segment filter — reconciling against company-wide books.
function computeReconRows(data, pl, si, ei) {
  if (!pl || !data || !data.revenue) return [];
  const ALL_SEGS = Object.keys(data.revenue);
  const plIdx = {};
  pl.months.forEach((m, i) => { plIdx[m] = i; });

  const out = [];
  for (let i = si; i <= ei; i++) {
    const mLabel = data.months[i];
    const pi = plIdx[mLabel];
    if (pi == null) continue;
    const ds = ALL_SEGS.reduce((t, s) => t + (data.revenue[s] ? data.revenue[s][i] || 0 : 0), 0);
    const qbo = pl.qboGross[pi] || 0;
    const v = ds - qbo;
    const pct = qbo !== 0 ? (v / Math.abs(qbo)) * 100 : (ds !== 0 ? 100 : 0);
    const ap = Math.abs(pct), av = Math.abs(v);
    const flag = (ap <= RECON_GREEN_PCT && av <= RECON_GREEN_ABS)
      ? 'green'
      : ((ap <= RECON_YELLOW_PCT && av <= RECON_YELLOW_ABS) ? 'yellow' : 'red');
    out.push({ month: mLabel, ds, qbo, v, pct, flag });
  }
  return out;
}

export { computeReconRows };

function ReconChart({ rows }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const labels = rows.map((r) => r.month);
    const dsData = rows.map((r) => r.ds);
    const qboData = rows.map((r) => r.qbo);
    const gc = 'rgba(255,255,255,0.1)';
    const tc = '#FFFFFF';

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Data-Summary', data: dsData, backgroundColor: '#378ADD', borderWidth: 0 },
          { label: 'QBO non-DTC', data: qboData, backgroundColor: '#FF6B35', borderWidth: 0 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        layout: { padding: { top: 18 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + fmtMoneyFull(c.parsed.y || 0) } },
        },
        scales: {
          x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
          y: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, callback: (v) => fmtMoney(v) } },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [rows]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

const FLAG_COLOR = { green: '#4ade80', yellow: '#fbbf24', red: '#f87171' };
const FLAG_BG = { green: '#14311a', yellow: '#332a14', red: '#2d1f1f' };
const FLAG_BORDER = { green: '#1a4a22', yellow: '#5a4720', red: '#5a2020' };
const FLAG_LABEL = { green: 'OK', yellow: 'Watch', red: 'Investigate' };

export default function ReconciliationTab({ data, pl, si, ei }) {
  const rows = useMemo(() => computeReconRows(data, pl, si, ei), [data, pl, si, ei]);

  if (!pl) {
    return (
      <div className="card">
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>
          QBO P&L data not loaded. Paste a "Profit and Loss by Month" export into
          the "gross p&l monthly" tab of your Google Sheet to enable reconciliation.
        </div>
      </div>
    );
  }

  const dsT = rows.reduce((t, r) => t + r.ds, 0);
  const qboT = rows.reduce((t, r) => t + r.qbo, 0);
  const vT = dsT - qboT;
  const pctT = qboT !== 0 ? (vT / Math.abs(qboT)) * 100 : 0;
  const vColor = Math.abs(pctT) <= 0.5 ? '#4ade80' : (Math.abs(pctT) <= 2 ? '#fbbf24' : '#f87171');

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <SummaryCard label="Data-Summary total (period)" value={fmtMoneyFull(dsT)} />
        <SummaryCard label="QBO non-DTC gross (period)" value={fmtMoneyFull(qboT)} />
        <SummaryCard
          label="Net variance"
          value={(vT >= 0 ? '+' : '\u2212') + fmtMoneyFull(Math.abs(vT))}
          valueColor={vColor}
          sub={<span style={{ color: '#94a3b8' }}>{pctT >= 0 ? '+' : ''}{pctT.toFixed(2)}% of QBO</span>}
        />
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="ctitle">Data-Summary vs QBO \u2014 gross revenue (non-DTC)</div>
        </div>
        <div className="legend">
          <span className="li"><span className="lsq" style={{ background: '#378ADD' }} />Data-Summary</span>
          <span className="li"><span className="lsq" style={{ background: '#FF6B35' }} />QBO non-DTC</span>
        </div>
        <ReconChart rows={rows} />
      </div>

      <div className="card" style={{ overflow: 'auto', maxHeight: 560 }}>
        <div className="card-hdr">
          <div className="ctitle">Monthly variance detail</div>
        </div>
        <table className="ctbl" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Month</th>
              <th style={{ textAlign: 'right' }}>Data-Summary</th>
              <th style={{ textAlign: 'right' }}>QBO non-DTC</th>
              <th style={{ textAlign: 'right' }}>Variance $</th>
              <th style={{ textAlign: 'right' }}>Variance %</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                No overlapping months in window. Widen the period filter or paste more months into the P&L tab.
              </td></tr>
            ) : rows.map((r) => (
              <tr key={r.month}>
                <td style={{ fontWeight: 600 }}>{r.month}</td>
                <td style={{ textAlign: 'right', color: '#fff' }}>{fmtMoneyFull(r.ds)}</td>
                <td style={{ textAlign: 'right', color: '#fff' }}>{fmtMoneyFull(r.qbo)}</td>
                <td style={{ textAlign: 'right', color: FLAG_COLOR[r.flag], fontWeight: 600 }}>
                  {(r.v >= 0 ? '+' : '\u2212') + fmtMoneyFull(Math.abs(r.v))}
                </td>
                <td style={{ textAlign: 'right', color: FLAG_COLOR[r.flag], fontWeight: 600 }}>
                  {(r.pct >= 0 ? '+' : '') + r.pct.toFixed(2)}%
                </td>
                <td>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
                    background: FLAG_BG[r.flag], color: FLAG_COLOR[r.flag],
                    border: '1px solid ' + FLAG_BORDER[r.flag],
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {FLAG_LABEL[r.flag]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '14px 0 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
          <div><strong style={{ color: '#94a3b8' }}>Method:</strong> QBO accounts 4102 (FS Delivery) + 4103 (FS Distributor) + 4104 (Retail), pre-discount gross, summed per month \u2014 compared to Data-Summary REVENUES.TOTAL row.</div>
          <div style={{ marginTop: 4 }}><strong style={{ color: '#4ade80' }}>Green</strong> \u2264 0.5% AND \u2264 $100 \u00b7 <strong style={{ color: '#fbbf24' }}>Yellow</strong> \u2264 2% AND \u2264 $500 \u00b7 <strong style={{ color: '#f87171' }}>Red</strong> beyond either threshold.</div>
          <div style={{ marginTop: 4 }}>A positive variance means Data-Summary is higher than QBO.</div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, valueColor, sub }) {
  return (
    <div style={{ background: '#2C2C2A', border: '2px solid #444441', borderRadius: 16, padding: '18px 22px' }}>
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: valueColor || '#fff', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
