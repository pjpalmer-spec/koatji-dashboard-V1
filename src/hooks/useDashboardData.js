import { useEffect, useState } from 'react';
import { fetchDashboard } from '../lib/api.js';

/**
 * Loads all three datasets once on mount. Returns { state, data } where
 * state is one of 'loading' | 'ready' | 'error'. On 'ready', data has
 * { data, customers, pl, meta }. On 'error', data has { message }.
 *
 * For an internal tool with a small team, one-shot load is fine — no need
 * for SWR/React Query or revalidation. Users hit refresh in the browser
 * when they want fresh numbers.
 */
export function useDashboardData() {
  const [state, setState] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard()
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setData({ message: err.message });
        setState('error');
      });
    return () => { cancelled = true; };
  }, []);

  return { state, data };
}
