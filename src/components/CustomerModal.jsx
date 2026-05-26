import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { fmtMoney } from '../lib/format.js';

Chart.register(...registerables);

// Customer detail modal. Shows lifetime stats, contact info, and per-month
// case chart. Simpler than v11's modal (no forecast splitting yet), but
// covers the daily-use fields.

const MNAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtMo(ym) {
  const p = ym.split('-');
  return MNAMES[parseInt(p[1] || 1) - 1] + ' ' + p[0];
}

function MonthlyChart({ customer }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const allMo = Object.keys(customer.mo).filter((k) => customer.mo[k] > 0).sort();
    const slice = allMo.slice(-24);
    const vals = slice.map((m) => customer.mo[m] || 0);
    const labels = slice.map((m) => MNAMES[parseInt(m.split('-')[1] || 1) - 1]);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: vals,
          backgroundColor: '#185FA5',
          borderWidth: 0,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        layout: { padding: { top: 8, bottom: 10, left: 0, right: 4 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ' ' + ctx.parsed.y + ' cases' } },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
          y: { display: true, grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 4, padding: 4 } },
        },
      },
    });

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [customer]);

  return <div style={{ position: 'relative', height: 155 }}><canvas ref={canvasRef} /></div>;
}

export default function CustomerModal({ customer, onClose }) {
  const lifetimeCases = customer.cases || 0;
  const lifetimeOrders = customer.orders || 0;
  const avgOrder = lifetimeOrders > 0 ? Math.round(lifetimeCases / lifetimeOrders * 10) / 10 : 0;
  let lifetimeRev = 0;
  if (customer.moRev) {
    for (const k in customer.moRev) lifetimeRev += customer.moRev[k] || 0;
  }

  const allMoKeys = Object.keys(customer.mo).filter((k) => customer.mo[k] > 0).sort().reverse();

  const cellPad = { padding: '14px 16px', borderRight: '0.5px solid #2a2f3a' };
  const lblS = { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500, marginBottom: 4 };
  const valLg = { fontSize: 22, fontWeight: 500, color: '#fff' };
  const valSm = { fontSize: 15, fontWeight: 500, color: '#fff', marginTop: 4 };

  return (
    <div className="modal open" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-body" style={{ padding: 0 }}>
          {/* Header */}
          <div style={{ background: '#185FA5', padding: '20px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#E6F1FB' }}>{customer.n}</div>
              <div style={{ fontSize: 13, color: '#85B7EB', marginTop: 3 }}>
                {customer.seg} · {customer.st}
                {customer.isTrial && ' · Trial'}
                {customer.doors > 0 && ` · ${customer.doors.toLocaleString()} doors`}
                {customer.city && ` · ${customer.city}${customer.state ? ', ' + customer.state : ''}`}
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderBottom: '0.5px solid #2a2f3a', background: '#14171e' }}>
            <div style={cellPad}><div style={lblS}>Cases</div><div style={valLg}>{lifetimeCases.toLocaleString()}</div></div>
            <div style={cellPad}><div style={lblS}>Orders</div><div style={valLg}>{(lifetimeOrders || 0).toLocaleString()}</div></div>
            <div style={cellPad}><div style={lblS}>Avg order</div><div style={valLg}>{(avgOrder || 0).toLocaleString()}</div></div>
            <div style={cellPad}><div style={lblS}>Revenue</div><div style={valLg}>{fmtMoney(lifetimeRev)}</div></div>
            <div style={cellPad}><div style={lblS}>First order</div><div style={valSm}>{customer.first || '\u2014'}</div></div>
            <div style={{ padding: '14px 16px' }}><div style={lblS}>Last order</div><div style={valSm}>{customer.last || customer.churn || '\u2014'}</div></div>
          </div>

          {/* Contact strip */}
          {(customer.cEmail || customer.cPhone || customer.addr) && (
            <div style={{ padding: '10px 22px', background: '#181c26', borderBottom: '0.5px solid #2a2f3a', fontSize: 12, color: '#94a3b8', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', fontWeight: 600 }}>Contact</span>
              {customer.cName && <span style={{ color: '#cbd5e1' }}>{customer.cName}</span>}
              {customer.cEmail && <a href={`mailto:${customer.cEmail.split(',')[0].trim()}`} style={{ color: '#85B7EB', textDecoration: 'none' }}>{customer.cEmail}</a>}
              {customer.cPhone && <a href={`tel:${customer.cPhone}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{customer.cPhone}</a>}
              {customer.addr && <span>{customer.addr}</span>}
            </div>
          )}

          {/* Monthly chart */}
          <div style={{ padding: '16px 22px 10px', background: '#1a1d27', borderBottom: '0.5px solid #2a2f3a' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 500, marginBottom: 10 }}>
              Cases per month
            </div>
            <MonthlyChart customer={customer} />
          </div>

          {/* Order list */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: '#14171e', zIndex: 1 }}>
                  <th style={{ textAlign: 'left', padding: '10px 22px', fontSize: 11, fontWeight: 500, color: '#64748b', textTransform: 'uppercase', borderBottom: '0.5px solid #2a2f3a' }}>Month</th>
                  <th style={{ textAlign: 'right', padding: '10px 22px', fontSize: 11, fontWeight: 500, color: '#64748b', textTransform: 'uppercase', borderBottom: '0.5px solid #2a2f3a' }}>Cases</th>
                </tr>
              </thead>
              <tbody>
                {allMoKeys.map((ym) => (
                  <tr key={ym}>
                    <td style={{ padding: '8px 22px', borderTop: '0.5px solid #1a1f2c', color: '#e2e8f0' }}>{fmtMo(ym)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 22px', borderTop: '0.5px solid #1a1f2c', fontWeight: 500, color: '#fff' }}>
                      {customer.mo[ym].toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
