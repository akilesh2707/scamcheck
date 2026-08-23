import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusChip from '../components/ui/StatusChip';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Reveal from '../components/ui/Reveal';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from '../hooks/useHistory';
import { riskLevelInfo, opportunityTypeLabel, formatDate } from '../utils/format';

export default function HistoryPage() {
  const { isAuthenticated, ready } = useAuth();
  const [page, setPage] = useState(1);
  const { data, status, error, reload } = useHistory(page, 10, isAuthenticated);

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <div className="sc-container" style={{ padding: '80px 24px', maxWidth: 560 }}>
        <EmptyState
          icon="history"
          title="Sign in to view your history"
          description="Your past ScamCheck reports are saved to your account so you can revisit them anytime."
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          <Button as={Link} to="/login" variant="primary" size="sm">
            Sign in
          </Button>
          <Button as={Link} to="/register" variant="ghost" size="sm">
            Create account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-container" style={{ padding: '40px 24px 96px', maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }} className="sc-animate-in">
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Your analysis history</h1>
        <p style={{ fontSize: 14.5, color: 'var(--sc-text-secondary)' }}>Every opportunity you've submitted to ScamCheck, most recent first.</p>
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="sc-skeleton" style={{ height: 84, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {status === 'error' && <ErrorState error={error} onRetry={reload} />}

      {status === 'success' && data?.reports?.length === 0 && (
        <EmptyState
          icon="file-text"
          title="No reports yet"
          description="Once you analyze an opportunity, it will show up here."
          actionLabel="Analyze an opportunity"
          onAction={() => {}}
        />
      )}

      {status === 'success' && data?.reports?.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.reports.map((r, i) => {
              const riskInfo = riskLevelInfo(r.risk?.level);
              return (
                <Reveal key={r.id} delay={i * 40}>
                  <Card as={Link} to={`/report/${r.id}`} state={{ report: r }} hoverable style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textDecoration: 'none' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--sc-text-muted)', marginBottom: 4 }}>
                        {opportunityTypeLabel(r.opportunity?.type)} · {formatDate(r.createdAt)}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.opportunity?.role || r.opportunity?.organization?.name || 'Analyzed opportunity'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                      <StatusChip label={riskInfo.label} tone={riskInfo.tone} size="sm" />
                      <Icon name="chevron-right" size={16} style={{ color: 'var(--sc-text-muted)' }} />
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28 }}>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', alignSelf: 'center' }}>
              Page {data.page} of {data.totalPages || 1}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= (data.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
