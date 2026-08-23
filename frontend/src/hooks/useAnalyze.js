import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const ANALYSIS_STEPS = [
  { key: 'extract', label: 'Extracting opportunity details' },
  { key: 'risk', label: 'Checking risk signals' },
  { key: 'payment', label: 'Analyzing payment claims' },
  { key: 'credibility', label: 'Evaluating credibility' },
  { key: 'evidence', label: 'Building your evidence report' },
];

/**
 * Drives the analyze flow: submits to the real API, and — while the single
 * request is in flight — advances a presentational step indicator on a
 * timer. The steps are cosmetic pacing, never a fake percentage tied to
 * actual progress the backend doesn't report.
 */
export function useAnalyze() {
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const run = useCallback(
    async (input) => {
      setStatus('loading');
      setError(null);
      setStepIndex(0);

      const stepTimer = setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
      }, 1000);

      try {
        let report;
        if (input.type === 'screenshot') {
          report = await api.analyzeScreenshot(input.value, input.userProfile);
        } else if (input.type === 'url') {
          report = await api.analyzeUrl(input.value, input.userProfile);
        } else {
          report = await api.analyzeText(input.value, input.userProfile);
        }
        clearInterval(stepTimer);
        setStatus('idle');
        navigate(`/report/${report.id}`, { state: { report } });
        return report;
      } catch (err) {
        clearInterval(stepTimer);
        setStatus('error');
        setError(err);
        throw err;
      }
    },
    [navigate]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setStepIndex(0);
  }, []);

  return { status, stepIndex, error, run, reset };
}
