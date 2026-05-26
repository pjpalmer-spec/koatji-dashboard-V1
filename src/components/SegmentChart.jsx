import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { SEG_COLORS, fmtMoney, fmtMoneyFull } from '../lib/format.js';

Chart.register(...registerables);

// Custom Chart.js plugin — draws the stacked-bar total above each column.
// Ported from v11's totalPlugin. Only fires on bar charts with stacked data.
//
// For money charts, formats as $1.9M / $162K. For others, uses thousands
// separators. The total floats above the tallest bar with a black stroke
// so it stays readable on any background.
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
      // Sum the stack at this index
      let total = 0;
      data.datasets.forEach((ds) => {
        if (ds.type !== 'line') {
          total += ds.data[i] || 0;
        }
      });
      if (total === 0) return;

      // Find the topmost Y pixel (smallest y value) across all datasets at i
      let topY = Infinity;
      data.datasets.forEach((ds, dsIdx) => {
        if (ds.type === 'line') return;
        const meta = chart.getDatasetMeta(dsIdx);
        if (meta.data[i] && meta.data[i].y < topY) {
          topY = meta.data[i].y;
        }
      });

      const pos = chart.getDatasetMeta(0).data[i];
      if (!pos) return;

      // Detect whether Y axis renders money — if so, format as money.
      let isMoney = false;
      try {
        const yopt = chart.options?.scales?.y;
        const sample = yopt?.ticks?.callback?.(1000);
        if (typeof sample === 'string' && sample.indexOf('$') === 0) isMoney = true;
      } catch (e) { /* noop */ }

      const text = isMoney ? fmtMoney(total) : Number(total).toLocaleString();

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
// Bar mode renders each segment as a stacked bar with a total label on top;
// line mode draws one line per segment, no fill.

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
          // Extra top padding so the total labels have room to render
          layout: { padding: { top: 32 } },
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
          // Extra top padding so the total labels have room to render
          layout: { padding: { top: 32 } },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: tooltipFormat } },
          },
          scales: {
            x: { stacked: true, grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 12 } },
            y: { ...yScale, stacked: true },
          },
        },
        plugins: [totalLabelsPlugin],
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
