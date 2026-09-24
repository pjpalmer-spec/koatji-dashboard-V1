import { SEG_COLORS, segGroupOf } from '../lib/format.js';

// Segment filter: pills grouped into Food Service Delivery / Retail /
// Food Service Distribution, with quick-select shortcut buttons.

const GROUP_LABELS = [
  ['FS', 'Food Service Delivery'],
  ['RT', 'Retail'],
  ['WH', 'Food Service Distribution'],
  ['Other', 'Other'],
];

// Order of the pills inside each group
const PILL_ORDER = [
  'FS Delivery - SoCal', 'FS Delivery - NY', 'FS-Direct Ship',
  'Retail',
  'FS Distributor - Global', 'FS Distributor - Odeko', 'FS Distributor - Other',
];

function pillRank(s) {
  const i = PILL_ORDER.indexOf(s);
  return i >= 0 ? i : 999;
}

export default function SegmentFilter({ segs, activeSegs, setActiveSegs }) {
  function toggle(s) {
    const next = activeSegs.includes(s)
      ? activeSegs.filter((x) => x !== s)
      : [...activeSegs, s];
    setActiveSegs(next);
  }

  function selectGroup(key) {
    const members = segs.filter((s) => segGroupOf(s) === key);
    if (!members.length) return;
    const allCurrent =
      activeSegs.length === members.length &&
      members.every((s) => activeSegs.includes(s));
    setActiveSegs(allCurrent ? [] : members);
  }

  return (
    <div className="control-card" style={{ flex: 1 }}>
      <div className="card-title">Segments</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'flex-start' }}>
        {GROUP_LABELS.map(([key, label]) => {
          const members = segs
            .filter((s) => segGroupOf(s) === key)
            .sort((a, b) => pillRank(a) - pillRank(b));
          if (!members.length) return null;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  paddingLeft: 2,
                }}
              >
                {label}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {members.map((s) => {
                  const col = SEG_COLORS[s] || '#aaa';
                  const on = activeSegs.includes(s);
                  return (
                    <button
                      key={s}
                      className={'seg-pill' + (on ? ' on' : '')}
                      onClick={() => toggle(s)}
                      style={{
                        borderColor: on ? col : '#2a2f3a',
                        background: on ? col + '33' : 'transparent',
                        color: on ? '#fff' : '#5a6478',
                      }}
                    >
                      <span className="seg-pill-dot" style={{ background: col }} />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button className="control-btn" onClick={() => setActiveSegs(segs.slice())}>All</button>
        <button className="control-btn" onClick={() => selectGroup('FS')}>FS Delivery only</button>
        <button className="control-btn" onClick={() => selectGroup('RT')}>Retail only</button>
        <button className="control-btn" onClick={() => selectGroup('WH')}>FS Distribution only</button>
        <button className="control-btn" onClick={() => setActiveSegs([])}>Clear</button>
      </div>
    </div>
  );
}
