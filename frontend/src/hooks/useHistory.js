import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useHistory(page = 1, limit = 20, enabled = true) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(enabled ? 'loading' : 'idle');
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!enabled) return;
    setStatus('loading');
    setError(null);
    api
      .getHistory(page, limit)
      .then((res) => {
        setData(res);
        setStatus('success');
      })
      .catch((err) => {
        setError(err);
        setStatus('error');
      });
  }, [page, limit, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, status, error, reload: load };
}
