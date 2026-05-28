import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { filtSum, aggregate } from '../lib/aggregate.js';

Chart.register(...registerables);

// Custom plugin — draws the stacked total above each bar.
// Same logic as in SegmentChart, kept inline here so DtcVsB2BChart has no
// cross-component dependency.
const totalLabelsPlugin = {
  id: 'totalLabels',
  afterDatasetsDraw(chart) {
    if (chart.config.type !== 'bar') return;
    const hasStack = chart.data.datasets.some((ds) => ds.stack);
    if (!hasStack) return;

    const ctx = chart.ctx;
    const data = chart.data;
    ctx.save();

    data.labels.forEach((_, i) => {
      let total = 0;
      data.datasets.forEach((ds) => {
        if (ds.type !== 'line') total += ds.data[i] || 0;
      });
      if (total === 0) return;

      let topY = Infinity;
      data.datasets.forEach((ds, dsIdx) => {
        if (ds.type === 'line') return;
        const meta = chart.getDatasetMeta(dsIdx);
        if (meta.data[i] && meta.data[i].y < topY) topY = meta.data[i].y;
      });

      const pos = chart.getDatasetMeta(0).data[i];
      if (!pos) return;

      const text = Number(total).toLocaleString();
      ctx.font = 'bold 13px Inter, Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.strokeText(text, pos.x, topY - 8);
      ctx.fillText(text, pos.x, topY - 8);
    });

    ctx.restore();
  },
};

// DTC vs B2B chart — two series (DTC raw + filtered B2B sum). Now shows
// stacked totals on top of each bar and respects granularity.
export default function DtcVsB2BChart({ data, activeSegs, si, ei, type = 'bar', granularity = 'monthly' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const months = data.months.slice(si, ei + 1);
    const dtcRaw = data.dtc.slice(si, ei + 1);
    const b2bRaw = months.map((_, i) => filtSum(data, activeSegs, 'cases', si + i));

    // Aggregate to chosen granularity
    const dtcAgg = aggregate(dtcRaw, months, granularity, false, false);
    const b2bAgg = aggregate(b2bRaw, months, granularity, false, false);
    const labels = dtcAgg.labels;
    const dtcVals = dtcAgg.values;
    const b2bVals = b2bAgg.values;

    const gc = 'rgba(255,255,255,0.1)';
    const tc = '#FFFFFF';
    const dtcCol = '#D85A30';
    const b2bCol = '#378ADD';

    const config = type === 'line'
      ? {
          type: 'line',
          data: {
            labels,
            datasets: [
              { label: 'DTC', data: dtcVals, borderColor: dtcCol, backgroundColor: 'transparent', tension: 0.3, pointRadius: 3, borderWidth: 2 },
              { label: 'B2B (filtered)', data: b2bVals, borderColor: b2bCol, backgroundColor: 'transparent', tension: 0.3, pointRadius: 3, borderWidth: 2 },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            layout: { padding: { top: 32 } },
            plugins: { legend: { display: true, labels: { color: '#fff', boxWidth: 12, font: { size: 12 } } } },
            scales: {
              x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
              y: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 } }, min: 0 },
            },
          },
        }
      : {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'DTC', data: dtcVals, backgroundColor: dtcCol + 'cc', stack: 's' },
              { label: 'B2B', data: b2bVals, backgroundColor: b2bCol + 'cc', stack: 's' },
            ],
          },
          options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            layout: { padding: { top: 32 } },
            plugins: { legend: { display: true, labels: { color: '#fff', boxWidth: 12, font: { size: 12 } } } },
            scales: {
              x: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
              y: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
            },
          },
          plugins: [totalLabelsPlugin],
        };

    chartRef.current = new Chart(canvasRef.current, config);
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data, activeSegs, si, ei, type, granularity]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 220 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
