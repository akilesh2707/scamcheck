import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

/** Fetches a report by id, unless one was already handed off via router state. */
export function useReport(id, preloaded) {
  const [report, setReport] = useState(preloaded || null);
  const [status, setStatus] = useState(preloaded ? 'success' : 'loading');
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!id) return;
    setStatus('loading');
    setError(null);
    api
      .getReport(id)
      .then((data) => {
        setReport(data);
        setStatus('success');
      })
      .catch((err) => {
        setError(err);
        setStatus('error');
      });
  }, [id]);

  useEffect(() => {
    if (preloaded) return;
    load();
  }, [load, preloaded]);

  return { report, status, error, reload: load };
}
