import { useMemo, useState } from 'react';
import { fmtMoney, SEG_COLORS, moToYM } from '../lib/format.js';
import CustomerModal from '../components/CustomerModal.jsx';

// Customers tab. Sortable + searchable table of all customers in the active
// segments. Click a customer name to open a detail modal with their monthly
// chart and full contact info.

function calcLastOrder(c, msYM, cSi, cEi) {
  let lastMo = '';
  msYM.slice(cSi, cEi + 1).forEach((mo) => {
    if (c.mo[mo] && c.mo[mo] > 0) lastMo = mo;
  });
  return lastMo;
}

function cWinCases(c, msYM, cSi, cEi) {
  let t = 0;
  msYM.slice(cSi, cEi + 1).forEach((mo) => { t += c.mo[mo] || 0; });
  return t;
}

function cWinRev(c, msYM, cSi, cEi) {
  if (!c.moRev) return 0;
  let t = 0;
  msYM.slice(cSi, cEi + 1).forEach((mo) => { t += c.moRev[mo] || 0; });
  return t;
}

export default function CustomersTab({ data, customers, activeSegs, si, ei }) {
  const [sortColumn, setSortColumn] = useState('cases');
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState('');
  const [openCust, setOpenCust] = useState(null);

  // Map dashboard month labels ("Jan25") to YYYY-MM keys used in customer data
  const msYM = useMemo(() => data.months.map((m) => moToYM(m)), [data.months]);
  const cSi = si, cEi = ei;

  function handleSort(col) {
    if (sortColumn === col) setSortDesc(!sortDesc);
    else { setSortColumn(col); setSortDesc(true); }
  }

  const filtered = useMemo(() => {
    if (!customers) return [];
    const fd = customers.filter((c) => activeSegs.includes(c.seg));
    const enriched = fd.map((c) => ({
      name: c.n, status: c.st, isTrial: !!c.isTrial, segment: c.seg,
      cases: cWinCases(c, msYM, cSi, cEi),
      revenue: cWinRev(c, msYM, cSi, cEi),
      first: c.first, last: calcLastOrder(c, msYM, cSi, cEi),
      doors: c.doors, orders: c.orders || 0, raw: c,
    }));

    enriched.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      let r = 0;
      if (['cases', 'doors', 'orders', 'revenue'].includes(sortColumn)) {
        r = sortDesc ? (bVal || 0) - (aVal || 0) : (aVal || 0) - (bVal || 0);
      } else if (sortColumn === 'first' || sortColumn === 'last') {
        const av = aVal || '', bv = bVal || '';
        r = sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
      } else {
        const av = String(aVal || '').toLowerCase();
        const bv = String(bVal || '').toLowerCase();
        r = sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      if (r !== 0 || sortColumn === 'cases') return r;
      return (b.cases || 0) - (a.cases || 0);
    });

    const term = search.trim().toLowerCase();
    return term ? enriched.filter((c) => c.name.toLowerCase().includes(term)) : enriched;
  }, [customers, activeSegs, msYM, cSi, cEi, sortColumn, sortDesc, search]);

  return (
    <>
      <div className="card" style={{ overflow: 'auto', maxHeight: 700 }}>
        <div className="card-hdr">
          <div className="ctitle">
            Customer Analytics — Period: {data.months[si]} to {data.months[ei]}
          </div>
        </div>
        <div style={{ padding: '0 0 14px 0' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search customers..."
            style={{
              width: '100%', background: '#1A1A1A', border: '1.5px solid #555',
              color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <table className="ctbl" style={{ width: '100%' }}>
          <thead>
            <tr>
              <SortHeader col="name" sortColumn={sortColumn} onClick={handleSort}>Customer</SortHeader>
              <SortHeader col="status" sortColumn={sortColumn} onClick={handleSort}>Status</SortHeader>
              <SortHeader col="segment" sortColumn={sortColumn} onClick={handleSort}>Segment</SortHeader>
              <SortHeader col="cases" sortColumn={sortColumn} onClick={handleSort}># Cases</SortHeader>
              <SortHeader col="revenue" sortColumn={sortColumn} onClick={handleSort} align="right">Revenue $</SortHeader>
              <SortHeader col="first" sortColumn={sortColumn} onClick={handleSort}>First Order</SortHeader>
              <SortHeader col="last" sortColumn={sortColumn} onClick={handleSort}>Last Order</SortHeader>
              <SortHeader col="orders" sortColumn={sortColumn} onClick={handleSort}># Orders</SortHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const col = SEG_COLORS[c.segment] || '#aaa';
              let pillCls = 'spill-d', pillTxt = c.status || '?';
              if (c.status === 'Active') { pillCls = 'spill-a'; pillTxt = 'Active'; }
              else if (c.status === 'Churned') { pillCls = 'spill-c'; pillTxt = 'Churned'; }
              return (
                <tr key={c.name}>
                  <td className="cust-name" onClick={() => setOpenCust(c.raw)}>
                    {c.name}
                    {c.doors > 0 && (
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                        Doors: {c.doors.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={'spill ' + pillCls}>{pillTxt}</span>
                    {c.isTrial && <span className="trial-tag">Trial</span>}
                  </td>
                  <td><span style={{ fontSize: 9, fontWeight: 700, color: col }}>{c.segment}</span></td>
                  <td style={{ fontWeight: 700, color: '#fff', textAlign: 'right' }}>{(c.cases || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#fff', fontWeight: 600 }}>{fmtMoney(c.revenue)}</td>
                  <td style={{ color: '#a0aec0', fontSize: 11 }}>{c.first || '\u2014'}</td>
                  <td style={{ color: '#a0aec0', fontSize: 11 }}>{c.last || '\u2014'}</td>
                  <td style={{ textAlign: 'right', color: '#fff', fontWeight: 600 }}>{(c.orders || 0).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openCust && <CustomerModal customer={openCust} onClose={() => setOpenCust(null)} />}
    </>
  );
}

function SortHeader({ col, sortColumn, onClick, children, align = 'left' }) {
  const active = sortColumn === col;
  return (
    <th
      style={{ cursor: 'pointer', textAlign: align }}
      onClick={() => onClick(col)}
    >
      {children} {active ? '↕' : ''}
    </th>
  );
}
