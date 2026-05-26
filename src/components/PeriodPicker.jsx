import { useMemo } from 'react';

// Period picker — dropdown of preset windows that drives si/ei, plus a dual
// range slider for custom ranges. Ports the dropdown+slider sync from v11.
//
// Selecting a preset writes to si/ei; the dropdown also flips to "custom" when
// the user drags either slider thumb.

const PRESETS = [
  { value: 'jan2025-jun2026', label: 'Jan 2025 - June 2026' },
  { value: 'jan2026-jun2026', label: 'Jan 2026 - June 2026' },
  { value: '2025-2026', label: '2025-2026 (Full Period)' },
  { divider: true },
  { value: 'last12', label: 'Last 12 Months' },
  { value: 'last6', label: 'Last 6 Months' },
  { value: 'last3', label: 'Last 3 Months' },
  { divider: true },
  { value: '2026ytd', label: '2026 Year-to-Date' },
  { value: '2025full', label: '2025 Full Year' },
  { value: '2024full', label: '2024 Full Year' },
  { divider: true },
  { value: 'q2-2026', label: 'Q2 2026 (Apr-June)' },
  { value: 'q1-2026', label: 'Q1 2026 (Jan-Mar)' },
  { value: 'q4-2025', label: 'Q4 2025 (Oct-Dec)' },
  { divider: true },
  { value: 'alltime', label: 'All Time' },
  { value: 'custom', label: 'Custom Range...' },
];

// miOf — find a month label in the data's months array. Falls back to last
// month if not found, matching v11's defensive behavior.
function miOf(months, label) {
  const i = months.indexOf(label);
  return i >= 0 ? i : months.length - 1;
}

export default function PeriodPicker({ months, si, ei, setSi, setEi }) {
  const last = months.length - 1;

  const presetValue = useMemo(() => {
    // Reverse-derive which preset matches current si/ei (or 'custom').
    // Matches lazily — if no preset matches, returns 'custom'.
    const m = months;
    if (si === miOf(m, 'Jan25') && ei === miOf(m, 'Jun26')) return 'jan2025-jun2026';
    if (si === miOf(m, 'Jan26') && ei === miOf(m, 'Jun26')) return 'jan2026-jun2026';
    if (si === 0 && ei === last) return 'alltime';
    if (si === miOf(m, 'Jan25') && ei === last) return '2025-2026';
    if (ei === last && si === Math.max(0, last - 11)) return 'last12';
    if (ei === last && si === Math.max(0, last - 5)) return 'last6';
    if (ei === last && si === Math.max(0, last - 2)) return 'last3';
    if (si === miOf(m, 'Jan26') && ei === last) return '2026ytd';
    if (si === miOf(m, 'Jan25') && ei === miOf(m, 'Dec25')) return '2025full';
    if (si === miOf(m, 'Mar24') && ei === miOf(m, 'Dec24')) return '2024full';
    if (si === miOf(m, 'Apr26') && ei === miOf(m, 'Jun26')) return 'q2-2026';
    if (si === miOf(m, 'Jan26') && ei === miOf(m, 'Mar26')) return 'q1-2026';
    if (si === miOf(m, 'Oct25') && ei === miOf(m, 'Dec25')) return 'q4-2025';
    return 'custom';
  }, [months, si, ei, last]);

  function applyPreset(value) {
    const m = months;
    switch (value) {
      case 'jan2025-jun2026': setSi(miOf(m, 'Jan25')); setEi(miOf(m, 'Jun26')); break;
      case 'jan2026-jun2026': setSi(miOf(m, 'Jan26')); setEi(miOf(m, 'Jun26')); break;
      case '2025-2026': setSi(miOf(m, 'Jan25')); setEi(last); break;
      case 'last12': setSi(Math.max(0, last - 11)); setEi(last); break;
      case 'last6': setSi(Math.max(0, last - 5)); setEi(last); break;
      case 'last3': setSi(Math.max(0, last - 2)); setEi(last); break;
      case '2026ytd': setSi(miOf(m, 'Jan26')); setEi(last); break;
      case '2025full': setSi(miOf(m, 'Jan25')); setEi(miOf(m, 'Dec25')); break;
      case '2024full': setSi(miOf(m, 'Mar24')); setEi(miOf(m, 'Dec24')); break;
      case 'q2-2026': setSi(miOf(m, 'Apr26')); setEi(miOf(m, 'Jun26')); break;
      case 'q1-2026': setSi(miOf(m, 'Jan26')); setEi(miOf(m, 'Mar26')); break;
      case 'q4-2025': setSi(miOf(m, 'Oct25')); setEi(miOf(m, 'Dec25')); break;
      case 'alltime': setSi(0); setEi(last); break;
      default: break; // 'custom' is informational only
    }
  }

  const displayLabel = presetValue === 'custom'
    ? `${months[si] || ''} – ${months[ei] || ''}`
    : (PRESETS.find((p) => p.value === presetValue)?.label || 'Custom');

  return (
    <div className="control-card">
      <div className="card-title">Time Period</div>
      <select
        className="control-dropdown"
        value={presetValue}
        onChange={(e) => applyPreset(e.target.value)}
      >
        {PRESETS.map((p, idx) =>
          p.divider
            ? <option key={`d${idx}`} disabled>────────</option>
            : <option key={p.value} value={p.value}>{p.label}</option>
        )}
      </select>
      <div className="range-slider-container">
        <div className="range-labels">
          <span>{months[0] || ''}</span>
          <span className="range-current">{displayLabel}</span>
          <span>{months[last] || ''}</span>
        </div>
        <input
          type="range"
          min={0}
          max={last}
          value={si}
          onChange={(e) => setSi(Math.min(parseInt(e.target.value), ei - 1))}
        />
        <input
          type="range"
          min={0}
          max={last}
          value={ei}
          style={{ marginTop: -4 }}
          onChange={(e) => setEi(Math.max(parseInt(e.target.value), si + 1))}
        />
      </div>
    </div>
  );
}
