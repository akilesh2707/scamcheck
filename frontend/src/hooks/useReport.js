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
    if (preloaded) {
      if (preloaded.accessToken && id) {
        try {
          localStorage.setItem(`scamcheck_report_token_${id}`, preloaded.accessToken);
        } catch (e) {
          void e;
        }
      }
      return;
    }

    if (typeof window !== 'undefined' && window.location?.search && id) {
      try {
        const params = new window.URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');
        if (tokenFromUrl) {
          localStorage.setItem(`scamcheck_report_token_${id}`, tokenFromUrl);
          // Strip token from URL to mitigate referrer and history leakage
          params.delete('token');
          const newQuery = params.toString();
          const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '') + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }
      } catch (e) {
        void e;
      }
    }

    load();
  }, [load, preloaded, id]);

  return { report, status, error, reload: load };
}
