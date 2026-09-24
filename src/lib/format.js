// Formatting helpers — ports of fmtMoney/fmtMoneyFull/fmt/pct from v11.

// Compact money: $162K, $1.9M. For chart Y-axes and tight tables.
export function fmtMoney(v) {
  if (v == null || isNaN(v) || v === 0) return '\u2014';
  v = Number(v);
  const neg = v < 0;
  const a = Math.abs(v);
  let s;
  if (a < 1) s = '$' + a.toFixed(2);
  else if (a >= 1000000) s = '$' + (a / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'M';
  else if (a >= 1000) s = '$' + Math.round(a / 1000) + 'K';
  else s = '$' + Math.round(a).toLocaleString();
  return neg ? '(' + s + ')' : s;
}

// Full money: $162,456. For KPI strip, modals, tooltips.
export function fmtMoneyFull(v) {
  if (v == null || isNaN(v) || v === 0) return '\u2014';
  v = Number(v);
  const neg = v < 0;
  const a = Math.abs(v);
  const s = a < 1 ? '$' + a.toFixed(2) : '$' + Math.round(a).toLocaleString();
  return neg ? '(' + s + ')' : s;
}

// Plain number with em-dash for zero. Decimal places: 1 if < 10, else int.
export function fmt(v) {
  if (typeof v !== 'number' || isNaN(v) || v === 0) return '\u2014';
  const r = Math.abs(v) < 10 ? Math.round(v * 10) / 10 : Math.round(v);
  return r.toLocaleString();
}

// Percentage change: returns null if base is zero/missing.
export function pct(a, b) {
  if (b === null || b === undefined || b === 0) return null;
  return Math.round((a - b) / Math.abs(b) * 1000) / 10;
}

// Convert "Jan25" → "2025-01" for cross-referencing customer monthly keys.
export function moToYM(m) {
  const map = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  return '20' + m.slice(3) + '-' + (map[m.slice(0, 3)] || '01');
}

// Quarter mapping helpers
const Q_MAP = {
  Jan: 'Q1', Feb: 'Q1', Mar: 'Q1', Apr: 'Q2', May: 'Q2', Jun: 'Q2',
  Jul: 'Q3', Aug: 'Q3', Sep: 'Q3', Oct: 'Q4', Nov: 'Q4', Dec: 'Q4',
};

export function gQ(m) {
  return '20' + m.slice(3) + '-' + (Q_MAP[m.slice(0, 3)] || 'Q?');
}

export function getPrevQ(q) {
  const [y, qPart] = q.split('-');
  const n = parseInt(qPart.replace('Q', ''));
  return n === 1 ? (parseInt(y) - 1) + '-Q4' : y + '-Q' + (n - 1);
}

// Segment color palette — names match OrderForm column J and Data-Summary.
export const SEG_COLORS = {
  'FS Delivery - SoCal':     '#378ADD',
  'FS Delivery - NY':        '#1D9E75',
  'FS-Direct Ship':          '#EF9F27',
  'Retail':                  '#D85A30',
  'FS Distributor - Global': '#9B59B6',
  'FS Distributor - Odeko':  '#D4537E',
  'FS Distributor - Other':  '#5DCAA5',
};

// Canonical segment order for buttons + charts.
// A segment only shows on the dashboard if it's listed here.
export const SEG_ORDER = [
  'FS Delivery - SoCal', 'FS Delivery - NY', 'FS-Direct Ship',
  'Retail',
  'FS Distributor - Global', 'FS Distributor - Odeko', 'FS Distributor - Other',
];

// Segment grouping for the quick-select pills:
//   'FS' = Food Service Delivery, 'RT' = Retail, 'WH' = Food Service Distribution
export function segGroupOf(s) {
  if (/^FS Distributor/i.test(s)) return 'WH';
  if (/^FS/i.test(s)) return 'FS';
  if (/^Retail$/i.test(s)) return 'RT';
  return 'Other';
}
