// Aggregation helpers that filter by selected segments + month range.
// Direct ports of filtSum / filtSumOrders / filtSumRev / filtAvgVel / filtLastDoor
// from the v11 popout's inline JS.
//
// Each takes the raw `data` object (from API response, payload.data) and
// returns the metric summed/averaged across `activeSegs` for month index `mi`.

export function filtSum(data, activeSegs, metric, mi) {
  return activeSegs.reduce((t, s) => {
    return t + (data[metric][s] ? (data[metric][s][mi] || 0) : 0);
  }, 0);
}

export function filtSumOrders(data, activeSegs, mi) {
  return activeSegs.reduce((t, s) => {
    return t + (data.orders[s] ? (data.orders[s][mi] || 0) : 0);
  }, 0);
}

export function filtSumRev(data, activeSegs, mi) {
  if (!data.revenue) return 0;
  return activeSegs.reduce((t, s) => {
    return t + (data.revenue[s] ? (data.revenue[s][mi] || 0) : 0);
  }, 0);
}

// Velocity averages only non-zero values, matching v11.
export function filtAvgVel(data, activeSegs, mi) {
  const vals = activeSegs
    .map((s) => (data.velocity[s] ? (data.velocity[s][mi] || 0) : 0))
    .filter((v) => v > 0);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
}

// Doors are "as of last month" not summed — each segment contributes its
// current door count, and total is sum across segments.
export function filtLastDoor(data, activeSegs, mi) {
  return activeSegs.reduce((t, s) => {
    return t + (data.doors[s] ? (data.doors[s][mi] || 0) : 0);
  }, 0);
}

// Quarter aggregation. Mirrors aggQ from v11.
//
// `quarter` is "2026-Q1". Returns array of month indices that fall in that
// quarter and are <= currentMi (so a partial-quarter KPI doesn't borrow
// from the future).
export function quarterMonthIndices(months, quarter, currentMi) {
  const Q_MAP = {
    Jan: 'Q1', Feb: 'Q1', Mar: 'Q1', Apr: 'Q2', May: 'Q2', Jun: 'Q2',
    Jul: 'Q3', Aug: 'Q3', Sep: 'Q3', Oct: 'Q4', Nov: 'Q4', Dec: 'Q4',
  };
  const out = [];
  months.forEach((m, i) => {
    const q = '20' + m.slice(3) + '-' + (Q_MAP[m.slice(0, 3)] || 'Q?');
    if (q === quarter && (currentMi == null || i <= currentMi)) out.push(i);
  });
  return out;
}
