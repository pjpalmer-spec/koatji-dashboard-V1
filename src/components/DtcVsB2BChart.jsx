import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { filtSum } from '../lib/aggregate.js';

Chart.register(...registerables);

// DTC vs B2B chart — two-series stacked bar (or two lines). DTC pulls from
// data.dtc; B2B is the filtered sum of all activeSegs' cases.

export default function DtcVsB2BChart({ data, activeSegs, si, ei, type = 'bar' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const months = data.months.slice(si, ei + 1);
    const dtcVals = data.dtc.slice(si, ei + 1);
    const b2bVals = months.map((_, i) => filtSum(data, activeSegs, 'cases', si + i));

    const gc = 'rgba(255,255,255,0.1)';
    const tc = '#FFFFFF';
    const dtcCol = '#D85A30';
    const b2bCol = '#378ADD';

    const config = type === 'line'
      ? {
          type: 'line',
          data: {
            labels: months,
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
            labels: months,
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
  }, [data, activeSegs, si, ei, type]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 220 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
