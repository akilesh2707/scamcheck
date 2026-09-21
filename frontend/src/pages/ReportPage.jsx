import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusChip from '../components/ui/StatusChip';
import RiskRing from '../components/ui/RiskRing';
import RiskMeter from '../components/ui/RiskMeter';
import MetricCard from '../components/ui/MetricCard';
import ErrorState from '../components/ui/ErrorState';
import Reveal from '../components/ui/Reveal';
import SignalRow from '../components/report/SignalRow';
import EvidenceList from '../components/report/EvidenceList';
import ReportSkeleton from '../components/report/ReportSkeleton';
import SectionHeading from '../components/report/SectionHeading';
import { useReport } from '../hooks/useReport';
import {
  riskLevelInfo,
  paymentStatusInfo,
  recommendationInfo,
  formatCurrency,
  formatDate,
  relativeTime,
  opportunityTypeLabel,
} from '../utils/format';

export default function ReportPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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

  const { opportunity = {}, risk = {}, credibility = {}, payment = {}, recommendation = {}, suitability = {} } = report;
  const riskInfo = riskLevelInfo(risk.level);
  const payInfo = paymentStatusInfo(payment.status);
  const recInfo = recommendationInfo(recommendation.decision);
  const org = opportunity.organization || {};
  const website = credibility.website || {};
  const company = credibility.company || {};
  const hasWebsiteData = !!(org.website || (opportunity.urls && opportunity.urls.length > 0));

  return (
    <div className="sc-container" style={{ padding: '32px 24px 96px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: 'var(--sc-text-muted)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
        <Link to="/analyze" style={{ color: 'var(--sc-text-muted)' }}>
          Analyze
        </Link>
        <Icon name="chevron-right" size={13} />
        <span style={{ color: 'var(--sc-text)', fontWeight: 600 }}>Verification Report</span>
      </nav>

      {/* Header */}
      <Reveal>
        <Card style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--sc-text-muted)', marginBottom: 6 }}>
              Opportunity Verification Report
            </div>
            <h1 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, marginBottom: 8, wordBreak: 'break-word' }}>
              {opportunity.role || org.name || 'Analyzed opportunity'}
              {org.name && opportunity.role ? ` — ${org.name}` : ''}
            </h1>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--sc-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="layers" size={13} /> {opportunityTypeLabel(opportunity.type)}
              </span>
              {opportunity.duration && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="clock" size={13} /> {opportunity.duration}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name="history" size={13} /> Submitted {relativeTime(report.createdAt)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button as={Link} to={`/intelligence/${report.id}`} state={{ report }} variant="ghost" size="sm" icon="target">
              Opportunity Intelligence
            </Button>
            <Button variant="primary" size="sm" icon="arrow-right" onClick={() => navigate('/analyze')}>
              Analyze Another
            </Button>
          </div>
        </Card>
      </Reveal>

      {/* Risk banner */}
      <Reveal delay={60}>
        <Card
          style={{
            marginBottom: 20,
            background: `var(--sc-${riskInfo.tone}-soft)`,
            border: `1px solid var(--sc-${riskInfo.tone}-border)`,
          }}
        >
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <RiskRing score={risk.score} tone={riskInfo.tone} sublabel={risk.score != null ? "/ 100" : ""} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: `var(--sc-${riskInfo.tone})`, marginBottom: 6 }}>{riskInfo.label}</h2>
              <p style={{ fontSize: 14.5, color: 'var(--sc-text-secondary)', marginBottom: 16 }}>{recInfo.summary}</p>
              <RiskMeter score={risk.score} tone={riskInfo.tone} />
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Metric row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} id="metric-grid">
        <Reveal delay={0}>
          <MetricCard icon="alert-triangle" label="Risk" value={risk.score != null ? `${risk.score}/100` : '—'} sublabel={riskInfo.label} tone={riskInfo.tone} />
        </Reveal>
        <Reveal delay={60}>
          <MetricCard
            icon="shield-check"
            label="Credibility"
            value={hasWebsiteData && credibility.score != null ? `${credibility.score}/100` : '—'}
            sublabel={
              !hasWebsiteData
                ? 'No website to check'
                : credibility.score == null
                ? 'Analysis unavailable'
                : credibility.score >= 70
                ? 'Good'
                : credibility.score >= 40
                ? 'Moderate'
                : 'Weak'
            }
            tone={!hasWebsiteData || credibility.score == null ? 'neutral' : credibility.score >= 70 ? 'success' : credibility.score >= 40 ? 'warning' : 'danger'}
          />
        </Reveal>
        <Reveal delay={120}>
          <MetricCard
            icon="credit-card"
            label="Payment"
            valueNode={<StatusChip label={payInfo.label} tone={payInfo.tone} size="sm" />}
            sublabel={payment.amount != null ? formatCurrency(payment.amount, opportunity.fees?.currency) : 'No amount detected'}
            tone={payInfo.tone}
          />
        </Reveal>
        <Reveal delay={180}>
          {suitability.status === 'COMPLETE' && suitability.score != null ? (
            <MetricCard
              icon="target"
              label="Suitability"
              value={`${suitability.score}/100`}
              sublabel="Fit for your profile"
              tone={suitability.score >= 70 ? 'success' : suitability.score >= 40 ? 'warning' : 'danger'}
            />
          ) : (
            <MetricCard
              icon="target"
              label="Suitability"
              value="—"
              sublabel={suitability.status === 'INSUFFICIENT_PROFILE_DATA' ? 'Add your profile to unlock' : 'Suitability analysis unavailable'}
              tone="neutral"
            />
          )}
        </Reveal>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} id="two-col-a">
        {/* Why we're concerned */}
        <Reveal>
          <Card style={{ height: '100%' }}>
            <SectionHeading title="Why we're concerned" />
            {risk.level === 'UNKNOWN' ? (
              <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="minus-circle" size={16} /> Risk analysis unavailable for this report.
              </p>
            ) : (risk.indicators || []).length === 0 && (!recommendation.cautionarySignals || recommendation.cautionarySignals.length === 0) && (!recommendation.unverifiedClaims || recommendation.unverifiedClaims.length === 0) ? (
              <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="check-circle" size={16} style={{ color: 'var(--sc-success)' }} /> No major risk indicators were found in this opportunity.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {risk.indicators && risk.indicators.map((ind, i) => (
                  <IndicatorRow key={ind.code + i} indicator={ind} />
                ))}
                {(recommendation.cautionarySignals || []).map((sig, i) => (
                  <div key={`c-${i}`} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: 'var(--sc-danger)', marginTop: 2, flexShrink: 0 }}>
                      <Icon name="alert-triangle" size={16} />
                    </span>
                    <div style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>{sig}</div>
                  </div>
                ))}
                {(recommendation.unverifiedClaims || []).map((sig, i) => (
                  <div key={`u-${i}`} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: 'var(--sc-warning)', marginTop: 2, flexShrink: 0 }}>
                      <Icon name="alert-circle" size={16} />
                    </span>
                    <div style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>{sig}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Reveal>

        {/* Evidence & verification */}
        <Reveal delay={80}>
          <Card style={{ height: '100%' }}>
            <SectionHeading title="Evidence & verification" />
            <EvidenceList items={[...(credibility.evidence || []), ...(payment.evidence || [])]} />
          </Card>
        </Reveal>
      </div>

      {/* Payment */}
      <Reveal>
        <Card style={{ marginBottom: 20 }} id="payment-verification">
          <SectionHeading title={<><Icon name="credit-card" size={17} /> Payment verification</>} />
          <PaymentBlock payment={payment} currency={opportunity.fees?.currency} />
        </Card>
      </Reveal>

      {/* Credibility signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} id="two-col-b">
        <Reveal>
          <Card style={{ height: '100%' }}>
            <SectionHeading title="Website credibility" />
            {hasWebsiteData ? (
              credibility.score == null ? (
                <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="minus-circle" size={16} /> Website analysis unavailable.
                </p>
              ) : (
                <>
                  <SignalRow label="HTTPS encryption" value={website.hasHttps} trueLabel="Detected" falseLabel="Not detected" />
                  <SignalRow label="Privacy policy" value={website.hasPrivacyPolicy} trueLabel="Found" falseLabel="Not found" />
                  <SignalRow label="Terms of service" value={website.hasTerms} trueLabel="Found" falseLabel="Not found" />
                  <SignalRow label="Refund policy" value={website.hasRefundPolicy} trueLabel="Found" falseLabel="Not found" />
                  <SignalRow label="Contact information" value={website.hasContactInfo} trueLabel="Found" falseLabel="Not found" />
                </>
              )
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="minus-circle" size={16} /> No organization website was found in this opportunity to check.
              </p>
            )}
          </Card>
        </Reveal>
        <Reveal delay={80}>
          <Card style={{ height: '100%' }}>
            <SectionHeading title="Organization identity" />
            <SignalRow label="Contact email domain matches org" value={company.emailDomainMatch} trueLabel="Matches" falseLabel="Mismatch" />
            <SignalRow label="Application domain matches org" value={company.applicationDomainMatch} trueLabel="Matches" falseLabel="Mismatch" />
            <SignalRow label="Contact details consistent" value={company.contactConsistency} trueLabel="Consistent" falseLabel="Inconsistent" />
            <p style={{ fontSize: 12.5, color: 'var(--sc-text-muted)', marginTop: 14, lineHeight: 1.6 }}>
              A legitimate-looking organization can still be impersonated. Identity and opportunity legitimacy are evaluated
              separately.
            </p>
          </Card>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #metric-grid { grid-template-columns: 1fr 1fr !important; }
          #two-col-a, #two-col-b { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          #metric-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Recommendation */}
      <Reveal>
        <Card
          style={{
            marginBottom: 20,
            background: `var(--sc-${recInfo.tone}-soft)`,
            border: `1px solid var(--sc-${recInfo.tone}-border)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Icon name={recInfo.tone === 'danger' ? 'ban' : recInfo.tone === 'success' ? 'check-circle' : 'alert-triangle'} size={20} style={{ color: `var(--sc-${recInfo.tone})` }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: `var(--sc-${recInfo.tone})`, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {recInfo.label}
            </h2>
          </div>
          {recommendation.summary && (
            <p style={{ fontSize: 14.5, color: 'var(--sc-text-secondary)', marginBottom: 16 }}>{recommendation.summary}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(recommendation.cautionarySignals || []).length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-danger)', marginBottom: 6 }}>Cautionary Signals</h3>
                <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--sc-text-secondary)' }}>
                  {recommendation.cautionarySignals.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {(recommendation.unverifiedClaims || []).length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-warning)', marginBottom: 6 }}>Unverified Claims</h3>
                <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--sc-text-secondary)' }}>
                  {recommendation.unverifiedClaims.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {(recommendation.verifiedFacts || []).length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-success)', marginBottom: 6 }}>Verified Facts</h3>
                <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--sc-text-secondary)' }}>
                  {recommendation.verifiedFacts.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {(recommendation.profileMatches || []).length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-primary)', marginBottom: 6 }}>Profile Matches</h3>
                <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--sc-text-secondary)' }}>
                  {recommendation.profileMatches.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {recommendation.paymentAdvisory && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-text)', marginBottom: 6 }}>Payment Advisory</h3>
                <p style={{ fontSize: 14, color: 'var(--sc-text-secondary)' }}>{recommendation.paymentAdvisory}</p>
              </div>
            )}

            {(recommendation.questionsToAsk || []).length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-text)', marginBottom: 6 }}>Questions to ask</h3>
                <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--sc-text-secondary)' }}>
                  {recommendation.questionsToAsk.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>
            )}

            {(recommendation.nextSteps || []).length > 0 && (
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sc-text)', marginBottom: 6 }}>Next Steps</h3>
                <ol style={{ paddingLeft: 20, fontSize: 14, color: 'var(--sc-text-secondary)' }}>
                  {recommendation.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            )}
          </div>
        </Card>
      </Reveal>

      {/* Suitability and Alternatives */}
      <Reveal>
        <SectionHeading title="Opportunity fit & Alternatives" />
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} id="fit-grid">
        <Reveal>
          <Card style={{ height: '100%', borderTop: '4px solid var(--sc-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Opportunity fit</h3>
                <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>
                  {suitability.status === 'COMPLETE' && suitability.score != null ? 'How well this aligns with your stated skills and goals.' : 'Add your profile when analyzing to unlock a personalized fit score.'}
                </p>
              </div>
              {suitability.status === 'COMPLETE' && suitability.score != null && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--sc-success)', lineHeight: 1 }}>{suitability.score}<span style={{ fontSize: 14, color: 'var(--sc-text-muted)' }}>/100</span></div>
                  <StatusChip label={suitability.score >= 70 ? 'Good match' : suitability.score >= 40 ? 'Partial match' : 'Weak match'} tone={suitability.score >= 70 ? 'success' : suitability.score >= 40 ? 'warning' : 'danger'} size="sm" />
                </div>
              )}
            </div>
            {suitability.status === 'COMPLETE' && suitability.score != null && Object.keys(suitability.breakdown || {}).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                 {Object.entries(suitability.breakdown).map(([key, val]) => (
                   <div key={key}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                       <span>{key}</span>
                       <span style={{ fontWeight: 600 }}>{val.score}%</span>
                     </div>
                     <div style={{ height: 6, background: 'var(--sc-bg)', borderRadius: 3, overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${val.score}%`, background: 'var(--sc-success)' }} />
                     </div>
                     <div style={{ fontSize: 11.5, color: 'var(--sc-text-muted)', marginTop: 4 }}>{val.reason}</div>
                   </div>
                 ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--sc-text-muted)' }}>Suitability scoring compares this opportunity against your skills, budget, and career goals once a profile is provided.</p>
            )}
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card style={{ height: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Skill gap analysis</h3>
            {suitability.status === 'UNAVAILABLE' ? (
              <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="minus-circle" size={16} /> Suitability analysis unavailable.
              </p>
            ) : (suitability.skillGap || []).length === 0 ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  No skill gap data is available for this report.
                </p>
                <p style={{ fontSize: 13, color: 'var(--sc-text-muted)' }}>Skill gap analysis appears once your profile includes skills to compare against this opportunity's requirements.</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  Where you already match, and what to strengthen.
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(suitability.skillGap || []).map((s, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)' }}>
                       <StatusChip label={s.skill} tone={s.currentLevel ? 'success' : 'warning'} size="sm" />
                       <span style={{ marginLeft: 8 }}>{s.currentLevel ? 'Matched' : 'Missing'}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <SectionHeading title="Alternatives" />
      </Reveal>
      {report.value?.status === 'UNAVAILABLE' ? (
        <Reveal>
          <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="minus-circle" size={15} /> Alternative search unavailable.
          </p>
        </Reveal>
      ) : (!report.alternatives || report.alternatives.length === 0) && (!report.value?.alternatives || report.value.alternatives.length === 0) ? (
        <Reveal>
          <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="minus-circle" size={15} /> No verified free or lower-cost alternative found.
          </p>
        </Reveal>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }} id="alt-grid">
          {(report.alternatives || report.value?.alternatives || []).map((alt, i) => (
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
                {alt.url && <a href={alt.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--sc-primary)', textDecoration: 'none', marginTop: 4 }}>Visit site</a>}
              </Card>
            </Reveal>
          ))}
        </div>
      )}
      <style>{`@media (max-width: 860px) { #fit-grid, #alt-grid { grid-template-columns: 1fr !important; } }`}</style>

      <p style={{ fontSize: 11.5, color: 'var(--sc-text-muted)', marginTop: 32, textAlign: 'center' }}>
        Report generated {formatDate(report.createdAt)} · ScamCheck provides evidence-based guidance, not legal or financial advice.
      </p>
    </div>
  );
}

function IndicatorRow({ indicator }) {
  const tone = indicator.evidence === 'CONTRADICTED' || indicator.points >= 30 ? 'danger' : indicator.points >= 15 ? 'warning' : 'neutral';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ color: `var(--sc-${tone})`, marginTop: 2, flexShrink: 0 }}>
        <Icon name="alert-triangle" size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{indicator.title}</span>
          <StatusChip label={indicator.evidence?.replace('_', ' ') || 'Observed'} tone={tone} size="sm" />
        </div>
        <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>{indicator.explanation}</p>
        {indicator.details && <p style={{ fontSize: 12, color: 'var(--sc-text-muted)', marginTop: 3 }}>{indicator.details}</p>}
      </div>
    </div>
  );
}

function PaymentBlock({ payment, currency }) {
  const info = paymentStatusInfo(payment.status);
  const hasAmount = payment.amount != null;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          padding: '18px 20px',
          background: `var(--sc-${info.tone}-soft)`,
          border: `1px solid var(--sc-${info.tone}-border)`,
          borderRadius: 'var(--sc-radius-sm)',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: `var(--sc-${info.tone})` }}>
            {hasAmount ? formatCurrency(payment.amount, currency) : payment.required ? 'Amount not specified' : 'No payment mentioned'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--sc-text-secondary)', marginTop: 4 }}>
            {payment.required
              ? payment.status === 'NOT_IMPLEMENTED' || payment.status === 'UNKNOWN'
                ? 'Payment requirement could not be independently verified.'
                : 'ScamCheck could not independently confirm this fee is legitimate.'
              : 'No upfront fee was identified in the submitted content.'}
          </div>
          {payment.purpose && (
            <div style={{ fontSize: 13, color: 'var(--sc-text-secondary)', marginTop: 4 }}>
              <strong>Purpose:</strong> {payment.purpose} | <strong>Type:</strong> {payment.paymentType || 'ONE_TIME'} | <strong>Refundable:</strong> {payment.refundable ? 'Yes' : 'No'}
            </div>
          )}
        </div>
        <StatusChip label={info.label} tone={info.tone} />
      </div>
      <EvidenceList items={payment.evidence} emptyLabel="No payment evidence recorded." />
    </div>
  );
}

function FurtherCard({ icon, title, body, to, state, cta }) {
  return (
    <Card hoverable style={{ display: 'flex', flexDirection: 'column' }}>
      <Icon name={icon} size={20} style={{ color: 'var(--sc-primary)', marginBottom: 12 }} />
      <h3 style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--sc-text-secondary)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{body}</p>
      <Button as={Link} to={to} state={state} variant="subtle" size="sm" icon="arrow-right" style={{ alignSelf: 'flex-start' }}>
        {cta}
      </Button>
    </Card>
  );
}
