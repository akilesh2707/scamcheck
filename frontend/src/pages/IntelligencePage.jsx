import { Link, useLocation, useParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusChip from '../components/ui/StatusChip';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Reveal from '../components/ui/Reveal';
import ProgressBar from '../components/report/ProgressBar';
import SectionHeading from '../components/report/SectionHeading';
import ReportSkeleton from '../components/report/ReportSkeleton';
import { useReport } from '../hooks/useReport';
import { recommendationInfo, formatCurrency, opportunityTypeLabel, riskLevelInfo } from '../utils/format';

const BREAKDOWN_LABELS = {
  skillMatch: 'Skill match',
  careerMatch: 'Career alignment',
  experienceMatch: 'Experience fit',
  eligibilityMatch: 'Eligibility',
  timeFit: 'Time commitment fit',
  costFit: 'Cost fit',
};

export default function IntelligencePage() {
  const { id } = useParams();
  const location = useLocation();
  const { report, status, error, reload } = useReport(id, location.state?.report);

  if (status === 'loading') return <ReportSkeleton />;
  if (status === 'error') {
    return (
      <div className="sc-container" style={{ padding: '64px 24px', maxWidth: 720 }}>
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!report) return null;

  const { opportunity = {}, suitability = {}, alternatives = [], value = {}, payment = {}, risk = {}, recommendation = {} } = report;
  const hasSuitability = suitability.status === 'COMPLETE' && suitability.score != null;
  const breakdownEntries = Object.entries(suitability.breakdown || {}).filter(([, v]) => v != null);
  const skillGap = suitability.skillGap || [];
  const strongSkills = skillGap.filter((s) => s.currentLevel && (!s.priority || s.priority === 'LOW'));
  const needsDevelopment = skillGap.filter((s) => !strongSkills.includes(s));
  const recInfo = recommendationInfo(recommendation.decision);
  const riskInfo = riskLevelInfo(risk.level);
  const altList = alternatives.length ? alternatives : value.alternatives || [];

  return (
    <div className="sc-container" style={{ padding: '32px 24px 96px' }}>
      <nav style={{ fontSize: 13, color: 'var(--sc-text-muted)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/analyze" style={{ color: 'var(--sc-text-muted)' }}>
          Analyze
        </Link>
        <Icon name="chevron-right" size={13} />
        <Link to={`/report/${report.id}`} state={{ report }} style={{ color: 'var(--sc-text-muted)' }}>
          Verification Report
        </Link>
        <Icon name="chevron-right" size={13} />
        <span style={{ color: 'var(--sc-text)', fontWeight: 600 }}>Opportunity Intelligence</span>
      </nav>

      <Reveal>
        <StatusChip label="Opportunity intelligence" tone="primary" icon="sparkles" />
        <h1 style={{ fontSize: 'clamp(24px,3.4vw,32px)', fontWeight: 800, margin: '16px 0 10px', letterSpacing: '-0.01em' }}>
          Is this opportunity worth pursuing?
        </h1>
        <p style={{ fontSize: 15, color: 'var(--sc-text-secondary)', maxWidth: 680, lineHeight: 1.6, marginBottom: 24 }}>
          ScamCheck compares the opportunity with your goals, skills, payment requirements, and available alternatives to help
          you make an informed decision.
        </p>
      </Reveal>

      <Reveal delay={40}>
        <Card style={{ marginBottom: 24, borderLeft: '4px solid var(--sc-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16.5, fontWeight: 800 }}>{opportunity.role || 'Analyzed opportunity'}{opportunity.organization?.name ? ` — ${opportunity.organization.name}` : ''}</h3>
            <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', marginTop: 4 }}>
              {opportunityTypeLabel(opportunity.type)}
              {opportunity.duration ? ` · ${opportunity.duration}` : ''}
            </p>
          </div>
          <StatusChip label="AI Analyzed" tone="primary" icon="sparkles" size="sm" />
        </Card>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} id="fit-grid">
        <Reveal>
          <Card style={{ height: '100%', borderTop: '4px solid var(--sc-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Opportunity fit</h3>
                <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>
                  {hasSuitability ? 'How well this aligns with your stated skills and goals.' : 'Add your profile when analyzing to unlock a personalized fit score.'}
                </p>
              </div>
              {hasSuitability && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--sc-success)', lineHeight: 1 }}>{suitability.score}<span style={{ fontSize: 14, color: 'var(--sc-text-muted)' }}>/100</span></div>
                  <StatusChip label={suitability.score >= 70 ? 'Good match' : suitability.score >= 40 ? 'Partial match' : 'Weak match'} tone={suitability.score >= 70 ? 'success' : suitability.score >= 40 ? 'warning' : 'danger'} size="sm" />
                </div>
              )}
            </div>
            {hasSuitability && breakdownEntries.length > 0 ? (
              breakdownEntries.map(([key, val]) => (
                <ProgressBar key={key} label={BREAKDOWN_LABELS[key] || key} value={val} tone="success" />
              ))
            ) : (
              <EmptyState icon="target" title="No profile data yet" description="Suitability scoring compares this opportunity against your skills, budget, and career goals once a profile is provided." />
            )}
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card style={{ height: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Skill gap analysis</h3>
            <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
              {skillGap.length ? 'Where you already match, and what to strengthen.' : 'No skill gap data is available for this report.'}
            </p>
            {skillGap.length === 0 ? (
              <EmptyState icon="layers" title="Nothing to compare yet" description="Skill gap analysis appears once your profile includes skills to compare against this opportunity's requirements." />
            ) : (
              <>
                {strongSkills.length > 0 && (
                  <div style={{ padding: 14, background: 'var(--sc-success-soft)', border: '1px solid var(--sc-success-border)', borderRadius: 'var(--sc-radius-sm)', marginBottom: 12 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sc-success)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Strong match</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {strongSkills.map((s) => (
                        <StatusChip key={s.skill} label={s.skill} tone="success" icon="check" size="sm" />
                      ))}
                    </div>
                  </div>
                )}
                {needsDevelopment.length > 0 && (
                  <div style={{ padding: 14, background: 'var(--sc-warning-soft)', border: '1px solid var(--sc-warning-border)', borderRadius: 'var(--sc-radius-sm)' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sc-warning)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Needs development</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {needsDevelopment.map((s) => (
                        <StatusChip key={s.skill} label={s.skill} tone="warning" icon="alert-triangle" size="sm" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </Reveal>
      </div>
      <style>{`@media (max-width: 860px) { #fit-grid { grid-template-columns: 1fr !important; } }`}</style>

      {/* Payment intelligence */}
      <Reveal>
        <SectionHeading title="Payment intelligence" />
        <Card style={{ marginBottom: 24, borderLeft: `4px solid var(--sc-warning)` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {payment.amount != null ? formatCurrency(payment.amount, opportunity.fees?.currency) : payment.required ? 'Amount unspecified' : 'No fee requested'}
              </div>
              <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', marginTop: 4 }}>
                {payment.required ? 'ScamCheck could not independently confirm this payment is required for the opportunity.' : 'No upfront fee was detected.'}
              </p>
            </div>
            <Button as={Link} to={`/report/${report.id}`} state={{ report }} variant="ghost" size="sm" icon="arrow-right">
              Investigate payment
            </Button>
          </div>
        </Card>
      </Reveal>

      {/* Alternatives */}
      <Reveal>
        <SectionHeading title="Better ways to reach the same goal" />
      </Reveal>
      {altList.length === 0 ? (
        <Reveal>
          <EmptyState
            icon="compass"
            title="No alternatives found yet"
            description="ScamCheck didn't find a verified free or lower-cost alternative for this specific opportunity. That doesn't confirm this one is legitimate — verify independently before paying."
          />
        </Reveal>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }} id="alt-grid">
          {altList.map((alt, i) => (
            <Reveal key={alt.name + i} delay={i * 70}>
              <Card hoverable style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{alt.name}</h4>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--sc-primary)', marginBottom: 4 }}>{formatCurrency(alt.cost)}</div>
                {alt.potentialSaving > 0 && (
                  <StatusChip label={`Save ${formatCurrency(alt.potentialSaving)}`} tone="success" size="sm" />
                )}
                {alt.gains?.length > 0 && (
                  <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    {alt.gains.map((g, gi) => (
                      <li key={gi} style={{ fontSize: 12.5, color: 'var(--sc-text-secondary)', display: 'flex', gap: 6 }}>
                        <Icon name="check" size={13} style={{ color: 'var(--sc-success)', flexShrink: 0, marginTop: 1 }} /> {g}
                      </li>
                    ))}
                  </ul>
                )}
                {alt.source && <p style={{ fontSize: 11.5, color: 'var(--sc-text-muted)', marginTop: 10 }}>Source: {alt.source}</p>}
              </Card>
            </Reveal>
          ))}
        </div>
      )}
      <style>{`@media (max-width: 860px) { #alt-grid { grid-template-columns: 1fr !important; } }`}</style>

      {/* Decision summary */}
      <Reveal>
        <div
          style={{
            background: 'var(--sc-text)',
            borderRadius: 'var(--sc-radius-lg)',
            padding: '32px 32px',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(248,250,252,0.6)', marginBottom: 8 }}>
            Your decision summary
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.01em' }}>{recInfo.label}</h3>
          <p style={{ fontSize: 14.5, color: 'rgba(248,250,252,0.8)', lineHeight: 1.6, marginBottom: 24, maxWidth: 640 }}>{recInfo.summary}</p>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 24 }}>
            <MiniStat label="Skill fit" value={hasSuitability ? (suitability.score >= 70 ? 'Good' : suitability.score >= 40 ? 'Partial' : 'Weak') : 'Unknown'} tone={hasSuitability ? (suitability.score >= 70 ? 'success' : 'warning') : 'neutral'} />
            <MiniStat label="Payment" value={payment.required ? 'Needs verification' : 'None requested'} tone={payment.required ? 'warning' : 'success'} />
            <MiniStat label="Risk level" value={riskInfo.label} tone={riskInfo.tone} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button as={Link} to={`/report/${report.id}`} state={{ report }} variant="primary" size="sm">
              Review risk report
            </Button>
            <Button as="a" href="#" onClick={(e) => e.preventDefault()} variant="ghost" size="sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Verify payment
            </Button>
            <Button as={Link} to="/analyze" variant="ghost" size="sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
              Analyze another
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const dotColor = `var(--sc-${tone === 'neutral' ? 'text-muted' : tone})`;
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'rgba(248,250,252,0.55)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14.5, fontWeight: 700 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor }} />
        {value}
      </div>
    </div>
  );
}
