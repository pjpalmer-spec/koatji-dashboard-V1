// ============================================================
// koatji-dashboard/src/lib/format.js — SEGMENT BLOCK (replace)
// Replace the existing SEG_COLORS, SEG_ORDER and segGroupOf with
// everything below. Nothing else in format.js changes.
// Segment names now match OrderForm column J, Data-Summary column A
// and the QBO customer types exactly.
// ============================================================

// Segment color palette — each old segment keeps its old color
export const SEG_COLORS = {
  'FS Delivery - SoCal':    '#378ADD', // was FS-SoCal
  'FS Delivery - NY':       '#1D9E75', // was FS-NY
  'FS-Direct Ship':         '#EF9F27', // was FS-Other
  'FS Distributor - Other': '#5DCAA5', // was WH-Other
  'FS Distributor - Odeko': '#D4537E', // was WH-ODEKO
  'FS Distributor - Global':'#9B59B6', // was WH-Japan + WH-Mexico
  'Retail':                 '#D85A30',
  // Old names kept so months before the rename still color correctly
  'FS-SoCal': '#378ADD', 'FS-NY': '#1D9E75', 'FS-Other': '#EF9F27',
  'WH-Other': '#5DCAA5', 'WH-ODEKO': '#D4537E',
  'WH-Japan': '#9B59B6', 'WH-Mexico': '#14B8A6',
};

// Canonical segment order for buttons + charts
export const SEG_ORDER = [
  'FS Delivery - SoCal', 'FS Delivery - NY', 'FS-Direct Ship',
  'FS Distributor - Other', 'FS Distributor - Odeko', 'FS Distributor - Global',
  'Retail',
];

// Segment grouping for the quick-select pills. Group keys are unchanged
// ('FS' = delivery + direct ship, 'WH' = distributors, 'RT' = retail) so
// no component code has to change; relabel the 'WH' pill to
// "Distributor" in the pill component if you want the new wording.
export function segGroupOf(s) {
  if (/^FS Distributor/i.test(s) || /^WH-/i.test(s)) return 'WH';
  if (/^FS /i.test(s) || /^FS-/i.test(s))             return 'FS';
  if (/^Retail$/i.test(s))                            return 'RT';
  return 'Other';
}
