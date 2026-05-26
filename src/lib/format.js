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

// Segment color palette — same as v11
export const SEG_COLORS = {
  'FS-SoCal': '#378ADD',
  'FS-NY': '#1D9E75',
  'FS-Other': '#EF9F27',
  'Retail': '#D85A30',
  'WH-ODEKO': '#D4537E',
  'WH-Japan': '#9B59B6',
  'WH-Mexico': '#14B8A6',
  'WH-Other': '#5DCAA5',
};

// Canonical segment order for buttons + charts
export const SEG_ORDER = [
  'FS-SoCal', 'FS-NY', 'FS-Other',
  'WH-Other', 'WH-ODEKO', 'WH-Japan', 'WH-Mexico',
  'Retail',
];

// Segment grouping for the FS/WH/Retail quick-select pills
export function segGroupOf(s) {
  if (/^FS-/i.test(s)) return 'FS';
  if (/^WH-/i.test(s)) return 'WH';
  if (/^Retail$/i.test(s)) return 'RT';
  return 'Other';
}
