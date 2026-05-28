import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { SEG_COLORS, fmtMoney, fmtMoneyFull } from '../lib/format.js';
import { aggregate } from '../lib/aggregate.js';

Chart.register(...registerables);

// Custom Chart.js plugin — draws the stacked-bar total above each column.
// Ported from v11's totalPlugin.
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

// SegmentChart — respects granularity prop (monthly or quarterly).
export default function SegmentChart({
  src, months, activeSegs,
  type = 'bar', isMoney = false, isVelocity = false, isDoors = false,
  granularity = 'monthly', height = 280,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const asegs = activeSegs.filter(
      (s) => src[s] && src[s].some((v) => v > 0)
    );

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    if (!asegs.length) return;

    const gc = 'rgba(255,255,255,0.1)';
    const tc = '#FFFFFF';

    // Aggregate per segment according to granularity. All segments share
    // the same labels — pull from first aggregation.
    const firstAgg = aggregate(src[asegs[0]] || [], months, granularity, isVelocity, isDoors);
    const labels = firstAgg.labels;

    const datasetsPerSeg = asegs.map((s) => {
      const a = aggregate(src[s] || [], months, granularity, isVelocity, isDoors);
      return { seg: s, values: a.values };
    });

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
          labels,
          datasets: datasetsPerSeg.map(({ seg, values }) => ({
            label: seg,
            data: values,
            borderColor: SEG_COLORS[seg] || '#aaa',
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
          labels,
          datasets: datasetsPerSeg.map(({ seg, values }) => ({
            label: seg,
            data: values,
            backgroundColor: SEG_COLORS[seg] || '#aaa',
            stack: 's',
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
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
  }, [src, months, activeSegs, type, isMoney, isVelocity, isDoors, granularity]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

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
