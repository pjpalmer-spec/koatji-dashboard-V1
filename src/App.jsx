import { useMemo, useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData.js';
import { SEG_ORDER } from './lib/format.js';
import PeriodPicker from './components/PeriodPicker.jsx';
import SegmentFilter from './components/SegmentFilter.jsx';
import KpiStrip from './components/KpiStrip.jsx';
import OverviewTab from './tabs/OverviewTab.jsx';
import MetricTab from './tabs/MetricTab.jsx';
import CustomersTab from './tabs/CustomersTab.jsx';

// Top-level app. Owns the global UI state:
//   - which tab is active
//   - which months are in the visible window (si / ei)
//   - which segments are active
//   - chart granularity (monthly vs quarterly)
// Then passes them into each tab. Data fetch happens once on mount.

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'cases', label: 'Cases' },
  { id: 'orders', label: 'Orders' },
  { id: 'doors', label: 'Doors' },
  { id: 'velocity', label: 'Velocity' },
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

  const segs = useMemo(
    () => SEG_ORDER.filter((s) => data.cases[s] && data.cases[s].some((v) => v > 0)),
    [data]
  );

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

  // Chart granularity: 'monthly' or 'quarterly'. Affects every chart that
  // accepts a granularity prop. KPIs always stay monthly because they're
  // single-period snapshots, not time series.
  const [granularity, setGranularity] = useState('monthly');

  // Revenue and Reconcile tabs removed (revenue no longer tracked in the dashboard).
  const visibleTabs = TABS;
  const showStripAndControls = tab !== 'customers';

  return (
    <div>
      <div style={{ background: 'white', height: 50 }} />

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

      <div className="controls">
        <div className="card-controls">
          <PeriodPicker months={months} si={si} ei={ei} setSi={setSi} setEi={setEi} />

          {/* Display granularity toggle — Monthly / Quarterly */}
          <div className="control-card">
            <div className="card-title">Display</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={'control-btn' + (granularity === 'monthly' ? ' active' : '')}
                onClick={() => setGranularity('monthly')}
                style={{ minWidth: 80 }}
              >
                Monthly
              </button>
              <button
                className={'control-btn' + (granularity === 'quarterly' ? ' active' : '')}
                onClick={() => setGranularity('quarterly')}
                style={{ minWidth: 80 }}
              >
                Quarterly
              </button>
            </div>
          </div>

          <SegmentFilter segs={segs} activeSegs={activeSegs} setActiveSegs={setActiveSegs} />
        </div>
      </div>

      {showStripAndControls && (
        <KpiStrip data={data} activeSegs={activeSegs} si={si} ei={ei} />
      )}

      {/* Tab content — granularity propagated to every tab that has charts */}
      {tab === 'overview' && <OverviewTab data={data} activeSegs={activeSegs} si={si} ei={ei} granularity={granularity} />}
      {tab === 'cases' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="cases" title="Cases by Segment" granularity={granularity} />}
      {tab === 'orders' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="orders" title="Orders by Segment" granularity={granularity} />}
      {tab === 'doors' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="doors" title="Doors by Segment" isDoors granularity={granularity} />}
      {tab === 'velocity' && <MetricTab data={data} activeSegs={activeSegs} si={si} ei={ei} metric="velocity" title="Velocity by Segment" isVelocity granularity={granularity} />}
      {tab === 'customers' && <CustomersTab data={data} customers={customers} activeSegs={activeSegs} si={si} ei={ei} />}
    </div>
  );
}
