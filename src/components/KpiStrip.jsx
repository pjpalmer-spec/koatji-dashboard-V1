import { useState } from 'react';
import { fmt, fmtMoney, pct, gQ, getPrevQ } from '../lib/format.js';
import {
  filtSum, filtSumOrders, filtSumRev, filtAvgVel, filtLastDoor,
  quarterMonthIndices,
} from '../lib/aggregate.js';

// KPI strip — single card with three period rows (Last Month, Last Quarter,
// Period) toggled by buttons. Each row shows 5 metrics: Cases, Orders, Doors,
// Velocity, Revenue. Direct port of the v11 collapsed strip.

function GrowthPill({ value, label }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <span style={{ color: up ? '#4ade80' : '#f87171', fontWeight: 700 }}>
      {up ? '\u2191' : '\u2193'}{Math.abs(value)}%
      <span style={{ color: '#4a5568', fontSize: 9, marginLeft: 4 }}>{label}</span>
    </span>
  );
}

function KpiCell({ label, value, growth, growthLabel }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12, color: '#94a3b8', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.025em', lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>
        {growth != null && <GrowthPill value={growth} label={growthLabel} />}
      </div>
    </div>
  );
}

export default function KpiStrip({ data, activeSegs, si, ei }) {
  const [period, setPeriod] = useState('lm'); // 'lm' | 'lq' | 'ep'
  const months = data.months;
  const n = months.length;

  // ── Last Month metrics ──
  const lmCases = filtSum(data, activeSegs, 'cases', ei);
  const lmCasesPrev = ei > 0 ? filtSum(data, activeSegs, 'cases', ei - 1) : null;
  const lmOrders = filtSumOrders(data, activeSegs, ei);
  const lmOrdersPrev = ei > 0 ? filtSumOrders(data, activeSegs, ei - 1) : null;
  const lmDoors = filtLastDoor(data, activeSegs, ei);
  const lmDoorsPrev = ei > 0 ? filtLastDoor(data, activeSegs, ei - 1) : null;
  const lmVel = filtAvgVel(data, activeSegs, ei);
  const lmVelPrev = ei > 0 ? filtAvgVel(data, activeSegs, ei - 1) : null;
  const lmRev = filtSumRev(data, activeSegs, ei);
  const lmRevPrev = ei > 0 ? filtSumRev(data, activeSegs, ei - 1) : null;
  const lmLabel = `Last Month \u2022 ${months[ei]}`;

  // ── Last Quarter metrics ──
  const curQ = gQ(months[ei]);
  const curQIs = quarterMonthIndices(months, curQ, ei);
  const prevQ = getPrevQ(curQ);
  const clipN = curQIs.length;
  const prevQIs = quarterMonthIndices(months, prevQ).slice(0, clipN)
    .filter((i) => i >= 0 && i < n);
  const lqCases = curQIs.reduce((t, i) => t + filtSum(data, activeSegs, 'cases', i), 0);
  const lqCasesPrev = prevQIs.reduce((t, i) => t + filtSum(data, activeSegs, 'cases', i), 0);
  const lqOrders = curQIs.reduce((t, i) => t + filtSumOrders(data, activeSegs, i), 0);
  const lqOrdersPrev = prevQIs.reduce((t, i) => t + filtSumOrders(data, activeSegs, i), 0);
  const lqDoors = curQIs.length ? filtLastDoor(data, activeSegs, curQIs[curQIs.length - 1]) : 0;
  const lqDoorsPrev = prevQIs.length ? filtLastDoor(data, activeSegs, prevQIs[prevQIs.length - 1]) : 0;
  const lqRev = curQIs.reduce((t, i) => t + filtSumRev(data, activeSegs, i), 0);
  const lqRevPrev = prevQIs.reduce((t, i) => t + filtSumRev(data, activeSegs, i), 0);
  const lqVels = curQIs.map((i) => filtAvgVel(data, activeSegs, i)).filter((v) => v > 0);
  const lqVel = lqVels.length ? Math.round(lqVels.reduce((a, b) => a + b, 0) / lqVels.length * 10) / 10 : 0;
  const pVels = prevQIs.map((i) => filtAvgVel(data, activeSegs, i)).filter((v) => v > 0);
  const lqVelPrev = pVels.length ? Math.round(pVels.reduce((a, b) => a + b, 0) / pVels.length * 10) / 10 : 0;
  const lqName = curQ.split('-')[1] + ' ' + curQ.split('-')[0];
  const partialTag = clipN < quarterMonthIndices(months, curQ).length ? ` (${clipN}mo)` : '';
  const lqLabel = `Last Quarter \u2022 ${lqName}${partialTag}`;

  // ── Period metrics (range si..ei) ──
  let epCases = 0, epOrders = 0, epRev = 0;
  for (let i = si; i <= ei; i++) {
    epCases += filtSum(data, activeSegs, 'cases', i);
    epOrders += filtSumOrders(data, activeSegs, i);
    epRev += filtSumRev(data, activeSegs, i);
  }
  const epDoors = filtLastDoor(data, activeSegs, ei);
  const epVels = [];
  for (let i = si; i <= ei; i++) {
    const v = filtAvgVel(data, activeSegs, i);
    if (v > 0) epVels.push(v);
  }
  const epVel = epVels.length ? Math.round(epVels.reduce((a, b) => a + b, 0) / epVels.length * 10) / 10 : 0;
  const epLabel = `Period \u2022 ${months[si]} \u2013 ${months[ei]}`;

  const activeLabel = period === 'lm' ? lmLabel : period === 'lq' ? lqLabel : epLabel;

  return (
    <div className="card" style={{ padding: '20px 24px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={'control-btn' + (period === 'lm' ? ' active' : '')}
            onClick={() => setPeriod('lm')}
            style={{ minWidth: 96 }}
          >Last Month</button>
          <button
            className={'control-btn' + (period === 'lq' ? ' active' : '')}
            onClick={() => setPeriod('lq')}
            style={{ minWidth: 96 }}
          >Last Quarter</button>
          <button
            className={'control-btn' + (period === 'ep' ? ' active' : '')}
            onClick={() => setPeriod('ep')}
            style={{ minWidth: 96 }}
          >Period</button>
        </div>
        <div
          style={{
            fontSize: 11, fontWeight: 600, color: '#94a3b8',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          {activeLabel}
        </div>
      </div>

      {period === 'lm' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 24px' }}>
          <KpiCell label="Cases" value={fmt(lmCases)} growth={pct(lmCases, lmCasesPrev)} growthLabel="MoM" />
          <KpiCell label="Orders" value={fmt(lmOrders)} growth={pct(lmOrders, lmOrdersPrev)} growthLabel="MoM" />
          <KpiCell label="Doors" value={fmt(lmDoors)} growth={pct(lmDoors, lmDoorsPrev)} growthLabel="MoM" />
          <KpiCell label="Velocity" value={lmVel > 0 ? lmVel.toFixed(1) : '\u2014'} growth={pct(lmVel, lmVelPrev)} growthLabel="MoM" />
          <KpiCell label="Revenue" value={fmtMoney(lmRev)} growth={pct(lmRev, lmRevPrev)} growthLabel="MoM" />
        </div>
      )}
      {period === 'lq' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 24px' }}>
          <KpiCell label="Cases" value={fmt(lqCases)} growth={pct(lqCases, lqCasesPrev)} growthLabel="QoQ" />
          <KpiCell label="Orders" value={fmt(lqOrders)} growth={pct(lqOrders, lqOrdersPrev)} growthLabel="QoQ" />
          <KpiCell label="Doors" value={fmt(lqDoors)} growth={pct(lqDoors, lqDoorsPrev)} growthLabel="QoQ" />
          <KpiCell label="Velocity" value={lqVel > 0 ? lqVel.toFixed(1) : '\u2014'} growth={pct(lqVel, lqVelPrev)} growthLabel="QoQ" />
          <KpiCell label="Revenue" value={fmtMoney(lqRev)} growth={pct(lqRev, lqRevPrev)} growthLabel="QoQ" />
        </div>
      )}
      {period === 'ep' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 24px' }}>
          <KpiCell label="Cases" value={fmt(epCases)} />
          <KpiCell label="Orders" value={fmt(epOrders)} />
          <KpiCell label="Doors" value={fmt(epDoors)} />
          <KpiCell label="Velocity" value={epVel > 0 ? epVel.toFixed(1) : '\u2014'} />
          <KpiCell label="Revenue" value={fmtMoney(epRev)} />
        </div>
      )}
    </div>
  );
}
