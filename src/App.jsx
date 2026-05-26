import { useMemo, useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData.js';
import { SEG_ORDER } from './lib/format.js';
import PeriodPicker from './components/PeriodPicker.jsx';
import SegmentFilter from './components/SegmentFilter.jsx';
import KpiStrip from './components/KpiStrip.jsx';
import OverviewTab from './tabs/OverviewTab.jsx';
import MetricTab from './tabs/MetricTab.jsx';
import ReconciliationTab, { computeReconRows } from './tabs/ReconciliationTab.jsx';
import CustomersTab from './tabs/CustomersTab.jsx';
import { fmtMoneyFull } from './lib/format.js';

// Top-level app. Owns the global UI state:
//   - which tab is active
//   - which months are in the visible window (si / ei)
//   - which segments are active
// Then passes them into each tab. Data fetch happens once on mount.

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'cases', label: 'Cases' },
  { id: 'orders', label: 'Orders' },
  { id: 'doors', label: 'Doors' },
  { id: 'velocity', label: 'Velocity' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'recon', label: 'Reconcile', requiresPL: true, isNew: true },
  { id: 'customers', label: 'Customers' },
];

export default function App() {
  const { state, data: payload } = useDashboardData();

  if (state === 'loading') {
    return <div className="loading">Loading data…</div>;
  }
  if (state === 'error') {
    return (
      <div className="err">
        <strong>Failed to load data:</strong>{'\n'}{payload.message}
        {'\n\n'}Check the browser console for details and verify VITE_API_URL is set.
      </div>
    );
  }

  return <Dashboard payload={payload} />;
}

function Dashboard({ payload }) {
  const data = payload.data;
  const customers = payload.customers?.customers || [];
  const pl = payload.pl && !payload.pl.error ? payload.pl : null;

  // Discover which segments are actually present in this dataset and respect
  // SEG_ORDER. Mirrors v11's filter.
  const segs = useMemo(
    () => SEG_ORDER.filter((s) => data.cases[s] && data.cases[s].some((v) => v > 0)),
    [data]
  );

  // Default window: Jan25..Jun26 (matches v11). Fall back to full range
  // if those labels aren't in this dataset.
  const months = data.months;
  const defaultSi = useMemo(() => {
    const i = months.indexOf('Jan25');
    return i >= 0 ? i : 0;
  }, [months]);
  const defaultEi = useMemo(() => {
    const i = months.indexOf('Jun26');
    return i >= 0 ? i : months.length - 1;
  }, [months]);

  const [si, setSi] = useState(defaultSi);
  const [ei, setEi] = useState(defaultEi);
  const [activeSegs, setActiveSegs] = useState(segs);
  const [tab, setTab] = useState('overview');

  // Reconciliation banner — count of yellow/red months in window
  const reconAlerts = useMemo(() => {
    if (!pl) return [];
    return computeReconRows(data, pl, si, ei).filter((r) => r.flag !== 'green');
  }, [data, pl, si, ei]);

  // Build tab list — hide Reconcile if no P&L
  const visibleTabs = TABS.filter((t) => !t.requiresPL || pl);

  // KPI strip + Controls visible on every tab except Customers and Reconcile
  // (where they don't add anything useful)
  const showStripAndControls = tab !== 'customers' && tab !== 'recon';

  return (
    <div>
      {/* White top bar — visual continuation of v11 layout */}
      <div style={{ background: 'white', height: 50 }} />

      {/* Tabs */}
      <div className="tabs-wrapper">
        <div className="tabs">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              className={'tab' + (tab === t.id ? ' on' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.isNew && <span className="tab-new">QBO</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Controls (period picker + segment filter) */}
      <div className="controls" style={{ display: showStripAndControls || tab === 'customers' ? 'block' : 'block' }}>
        <div className="card-controls">
          <PeriodPicker months={months} si={si} ei={ei} setSi={setSi} setEi={setEi} />
          <div className="control-card">
            <div className="card-title">Display</div>
            <div style={{ fontSize: 12, color: '#888' }}>Bar/line toggle is on each chart.</div>
          </div>
          <SegmentFilter segs={segs} activeSegs={activeSegs} setActiveSegs={setActiveSegs} />
        </div>
      </div>

      {/* Reconciliation alert banner */}
      {reconAlerts.length > 0 && (
        <div
          onClick={() => setTab('recon')}
          style={{
            background: 'linear-gradient(90deg, #3a2418, #2a1810)',
            border: '2px solid #FF6B35',
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 13,
          }}
        >
          <span style={{ fontSize: 22 }}>⚠</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#FFB89A', marginBottom: 2 }}>
              Revenue reconciliation — {reconAlerts.length} month{reconAlerts.length > 1 ? 's' : ''} need review
            </div>
            <div style={{ color: '#cbd5e1', fontSize: 12 }}>
              {reconAlerts.slice(0, 3).map((r, i) => {
                const sign = r.v >= 0 ? '+' : '\u2212';
                return (i > 0 ? '  ·  ' : '') + `${r.month} ${sign}${fmtMoneyFull(Math.abs(r.v))}`;
              }).join('')}
              {reconAlerts.length > 3 && `  ·  +${reconAlerts.length - 3} more`}
            </div>
          </div>
          <div style={{ color: '#FFB89A', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Open →
          </div>
        </div>
      )}

      {/* KPI strip */}
      {showStripAndControls && (
        <KpiStrip data={data} activeSegs={activeSegs} si={si} ei={ei} />
      )}

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab data={data} activeSegs={activeSegs} si={si} ei={ei} />}
      {tab === 'cases' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="cases" title="Cases by Segment" />}
      {tab === 'orders' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="orders" title="Orders by Segment" />}
      {tab === 'doors' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="doors" title="Doors by Segment" />}
      {tab === 'velocity' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="velocity" title="Velocity by Segment" isVelocity />}
      {tab === 'revenue' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="revenue" title="Gross Revenue by Segment" isMoney />}
      {tab === 'recon' && <ReconciliationTab data={data} pl={pl} si={si} ei={ei} />}
      {tab === 'customers' && <CustomersTab data={data} customers={customers} activeSegs={activeSegs} si={si} ei={ei} />}
    </div>
  );
}
