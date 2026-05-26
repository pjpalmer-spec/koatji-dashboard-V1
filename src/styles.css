/* ============================================================
   KOATJI Dashboard global styles
   Direct port of v11's inline CSS. Kept class names intact so
   future side-by-side comparisons are easy.
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; width: 100%; overflow-x: hidden; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #1A1A1A;
  padding: 16px;
  font-size: 16px;
  color: #FFFFFF;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

@media (min-width: 1200px) { body { font-size: 18px; padding: 20px; } }
@media (min-width: 1600px) { body { font-size: 20px; padding: 24px; } }

/* ── Tabs ── */
.tabs-wrapper {
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border-bottom: 2px solid #444;
  padding: 0;
}
.tabs { display: flex; gap: 0; flex-wrap: wrap; }
.tab {
  font-size: 18px;
  font-weight: 500;
  padding: 16px 24px;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
  text-align: center;
}
@media (min-width: 768px) { .tab { padding: 18px 28px; } }
@media (min-width: 1200px) { .tab { font-size: 20px; padding: 20px 32px; } }
.tab:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
.tab.on {
  color: #fff;
  font-weight: 600;
  border-bottom-color: #FF6B35;
  background: rgba(255, 107, 53, 0.1);
}
.tab-new {
  display: inline-block;
  background: #FF4444;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 2px;
  margin-left: 4px;
  text-transform: uppercase;
  vertical-align: middle;
}

/* ── Cards ── */
.controls {
  background: #2C2C2A;
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  border: 2px solid #444441;
}
.card {
  background: #2C2C2A;
  border: 2px solid #1A1A1A;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
}
.card-hdr {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.ctitle {
  font-size: 25px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  width: 100%;
}

/* ── Legends ── */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}
.li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}
.lsq {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

/* ── Loading / errors ── */
.loading {
  text-align: center;
  padding: 60px 0;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.err {
  color: #FF6B35;
  padding: 16px 20px;
  background: #FFF5F2;
  border-radius: 16px;
  border: 2px solid #FF6B35;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: pre-wrap;
}

/* ── Controls ── */
.card-controls {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 20px;
  align-items: start;
}
.control-card {
  background: #1e1e1e;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #333;
}
.card-title {
  font-size: 10px;
  color: #888;
  margin-bottom: 6px;
  text-transform: uppercase;
  font-weight: 600;
}
.control-dropdown {
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  min-width: 180px;
}
.control-btn {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #444;
  background: #333;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  text-align: center;
}
.control-btn:hover { background: #555; }
.control-btn.active { background: #FF6B35; border-color: #FF6B35; }

.range-slider-container {
  margin-top: 8px;
  padding: 6px 0;
  border-top: 1px solid #444;
}
.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #888;
  margin-bottom: 4px;
}
.range-current { color: #FF6B35; font-weight: 600; }

input[type='range'] {
  width: 100%;
  height: 4px;
  background: #444;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF6B35;
  cursor: pointer;
  border: 1px solid #fff;
}
input[type='range']::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF6B35;
  cursor: pointer;
  border: 1px solid #fff;
}

/* ── Segment pills ── */
.seg-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 16px;
  border: 2px solid #444441;
  background: #2C2C2A;
  cursor: pointer;
  color: #fff;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.seg-pill:hover { background: #444441; transform: translateY(-1px); }
.seg-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Chart-type toggle ── */
.ct-tgl {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 16px;
  border: 2px solid #2C2C2A;
  background: #fff;
  cursor: pointer;
  color: #1A1A1A;
  transition: all 0.2s;
}
.ct-tgl.on { background: #FF6B35; color: #fff; border-color: #FF6B35; }

/* ── Customer table ── */
.ctbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
@media (min-width: 1200px) { .ctbl { font-size: 14px; } }
.ctbl th {
  font-size: 10px;
  font-weight: 700;
  color: #7ec8f5;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 7px 10px;
  border-bottom: 1px solid #2a2f3a;
  text-align: left;
  background: #14171e;
  position: sticky;
  top: 0;
}
@media (min-width: 1200px) { .ctbl th { font-size: 12px; padding: 10px 12px; } }
.ctbl td {
  padding: 6px 10px;
  border-bottom: 1px solid #1a1f2c;
  color: #c8cdd8;
  vertical-align: middle;
}
@media (min-width: 1200px) { .ctbl td { padding: 8px 12px; } }
.ctbl tr:hover td { background: #1a1f2c; }

/* ── Status pills ── */
.spill {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.spill-a { background: #14311a; color: #4ade80; border: 1px solid #1a4a22; }
.spill-c { background: #2d1f1f; color: #f87171; border: 1px solid #5a2020; }
.spill-d { background: #1f2428; color: #94a3b8; border: 1px solid #2a3038; }
.trial-tag {
  display: inline-block;
  margin-left: 4px;
  font-size: 8px;
  font-weight: 700;
  color: #86efac;
  background: #0f2419;
  padding: 2px 5px;
  border-radius: 3px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid #1a4a22;
}

/* ── Customer name link ── */
.cust-name {
  font-weight: 600;
  color: #e2e8f0;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: all 0.2s;
}
.cust-name:hover { text-decoration-color: #4a9eed; color: #4a9eed; }

/* ── Modal ── */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}
.modal.open { display: flex; align-items: flex-start; justify-content: center; padding-top: 1vh; }
.modal-content {
  background: #1e2330;
  padding: 0;
  border-radius: 12px;
  width: 98%;
  max-width: 1400px;
  max-height: 94vh;
  overflow: hidden;
  border: 1px solid #2a2f3a;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
}
.modal-body {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
  color: #e2e8f0;
}
.modal-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #E6F1FB;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
}
.modal-close:hover { background: rgba(255, 255, 255, 0.3); }

/* ── Segment breakdown rows ── */
.seg-section {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 24px 0 16px 0;
}
.seg-row {
  background: #2C2C2A;
  border: 2px solid #1A1A1A;
  border-radius: 16px;
  padding: 20px 28px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.seg-row-chart {
  flex: 1;
  position: relative;
  height: 80px;
  min-width: 0;
}
