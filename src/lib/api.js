// Thin wrapper around the Apps Script Web App endpoint.
//
// The script returns one of two shapes depending on the ?dataset query:
//   - default: { data, customers, pl, meta: { generatedAt, partialErrors } }
//   - ?dataset=data|customers|pl: just that slice
//
// We always call the default endpoint and destructure on the client side, so
// one request gets everything the dashboard needs on initial load.

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL || API_URL.includes('PASTE-YOUR')) {
  // Loud, early failure — better than a confusing CORS error 20 components deep.
  console.error(
    'VITE_API_URL is not set. Copy .env.example to .env.local and paste the ' +
    'Apps Script /exec URL, OR set it in Netlify Site settings → Environment variables.'
  );
}

/**
 * Fetches all dashboard data from the Apps Script endpoint.
 *
 * Returns: { data, customers, pl, meta }
 * Throws on network or HTTP failure. Returns partial data with meta.partialErrors
 * populated when some loaders failed but others succeeded — components should
 * check for that and degrade gracefully (the Reconciliation tab, for example,
 * should hide itself if pl.error is set).
 */
export async function fetchDashboard() {
  if (!API_URL || API_URL.includes('PASTE-YOUR')) {
    throw new Error(
      'API URL not configured. Set VITE_API_URL in .env.local (local) or ' +
      'Netlify environment variables (production).'
    );
  }

  const resp = await fetch(API_URL, { method: 'GET' });
  if (!resp.ok) {
    throw new Error(`API HTTP ${resp.status}: ${await resp.text()}`);
  }

  const payload = await resp.json();
  if (payload.error) {
    throw new Error(`API error: ${payload.error}`);
  }

  return payload;
}
