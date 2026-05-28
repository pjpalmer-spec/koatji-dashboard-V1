import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { filtSum } from '../lib/aggregate.js';
import { aggregate } from '../lib/aggregate.js';

Chart.register(...registerables);

// DTC vs B2B chart — two series, respects granularity.
export default function DtcVsB2BChart({ data, activeSegs, si, ei, type = 'bar', granularity = 'monthly' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const months = data.months.slice(si, ei + 1);
    const dtcRaw = data.dtc.slice(si, ei + 1);
    const b2bRaw = months.map((_, i) => filtSum(data, activeSegs, 'cases', si + i));

    // Aggregate to chosen granularity (sums for both DTC and B2B)
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
            layout: { padding: { top: 22 } },
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
            layout: { padding: { top: 22 } },
            plugins: { legend: { display: true, labels: { color: '#fff', boxWidth: 12, font: { size: 12 } } } },
            scales: {
              x: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
              y: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
            },
          },
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
