import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { SEG_COLORS, fmtMoney, fmtMoneyFull } from '../lib/format.js';

Chart.register(...registerables);

// SegmentChart — one chart per metric, with bar or line mode.
//
// Props:
//   src         — D.cases, D.orders, etc. — { [segment]: [...monthly vals] }
//   months      — array of "Jan25" labels (already sliced to si..ei)
//   activeSegs  — segments to render
//   type        — 'bar' or 'line'
//   isMoney     — true for revenue; formats Y axis + tooltips as $
//   isVelocity  — true for velocity; caps Y at 25 to match v11
//
// Bar mode renders each segment as a stacked bar; line mode draws one line
// per segment, no fill. Direct port of drawChart() from v11.

export default function SegmentChart({
  src, months, activeSegs, type = 'bar', isMoney = false, isVelocity = false, height = 280,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Filter to segments that actually have data in this window
    const asegs = activeSegs.filter(
      (s) => src[s] && src[s].some((v) => v > 0)
    );

    // Destroy any existing chart before re-rendering
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (!asegs.length) return;

    const gc = 'rgba(255,255,255,0.1)';
    const tc = '#FFFFFF';

    const yScale = {
      grid: { color: gc },
      ticks: {
        color: tc,
        font: { size: 10 },
        callback: (v) => (isMoney ? fmtMoney(v) : Number(v).toLocaleString()),
      },
      min: 0,
    };
    if (isVelocity) yScale.max = 25;

    const tooltipFormat = isMoney
      ? (c) => c.dataset.label + ': ' + fmtMoneyFull(c.parsed.y || 0)
      : (c) => c.dataset.label + ': ' + Number(c.parsed.y || 0).toLocaleString();

    let config;
    if (type === 'line') {
      config = {
        type: 'line',
        data: {
          labels: months,
          datasets: asegs.map((s) => ({
            label: s,
            data: src[s],
            borderColor: SEG_COLORS[s] || '#aaa',
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2,
            spanGaps: true,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          layout: { padding: { top: 22 } },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: tooltipFormat } },
          },
          scales: {
            x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
            y: yScale,
          },
        },
      };
    } else {
      config = {
        type: 'bar',
        data: {
          labels: months,
          datasets: asegs.map((s) => ({
            label: s,
            data: src[s],
            backgroundColor: SEG_COLORS[s] || '#aaa',
            stack: 's',
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          layout: { padding: { top: 22 } },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: tooltipFormat } },
          },
          scales: {
            x: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
            y: { ...yScale, stacked: true },
          },
        },
      };
    }

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [src, months, activeSegs, type, isMoney, isVelocity]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// Small legend component used above charts
export function ChartLegend({ activeSegs }) {
  return (
    <div className="legend">
      {activeSegs.map((s) => (
        <span className="li" key={s}>
          <span className="lsq" style={{ background: SEG_COLORS[s] || '#aaa' }} />
          {s}
        </span>
      ))}
    </div>
  );
}
