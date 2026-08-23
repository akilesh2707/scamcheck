import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import StatusChip from '../components/ui/StatusChip';
import Card from '../components/ui/Card';
import ScrollReveal from '../components/ui/ScrollReveal';
import RiskRing from '../components/ui/RiskRing';

const VERIFY_TAGS = ['Internship', 'Job offer', 'Course', 'Certification', 'Website'];

const HOW_IT_WORKS = [
  {
    icon: 'file-text',
    title: 'Paste the opportunity',
    body: 'Drop in the message, job post, or course listing exactly as you received it — WhatsApp, email, LinkedIn, or a website URL.',
  },
  {
    icon: 'activity',
    title: 'ScamCheck analyzes it',
    body: 'Risk signals, payment claims, and organization credibility are checked against known scam patterns in seconds.',
  },
  {
    icon: 'shield-check',
    title: 'Get a plain-English report',
    body: 'A risk score, the evidence behind it, and clear next steps — before you apply, pay, or share anything.',
  },
];

const FEATURES = [
  {
    icon: 'alert-triangle',
    title: 'Risk detection',
    body: 'Flags urgency pressure, guaranteed-placement claims, and requests for sensitive information.',
    tone: 'danger',
  },
  {
    icon: 'shield-check',
    title: 'Credibility signals',
    body: 'Checks HTTPS, policy pages, and organization identity — shown as individual signals, not a single verdict.',
    tone: 'primary',
  },
  {
    icon: 'credit-card',
    title: 'Payment verification',
    body: "Surfaces upfront fees and marks them clearly as verified, disputed, or needing your own confirmation.",
    tone: 'warning',
  },
  {
    icon: 'file-text',
    title: 'Traceable evidence',
    body: 'Every claim is labeled — observed in your message, verified externally, or still uncertain.',
    tone: 'neutral',
  },
  {
    icon: 'target',
    title: 'Suitability fit',
    body: 'Optionally compares the opportunity against your skills and goals to gauge real fit.',
    tone: 'success',
  },
  {
    icon: 'compass',
    title: 'Safer alternatives',
    body: 'Surfaces free or lower-cost paths to the same outcome when one is available.',
    tone: 'primary',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero */}
      <section style={{ background: 'linear-gradient(180deg, #EEF3FC 0%, var(--sc-bg) 78%)', paddingTop: 64, paddingBottom: 72, position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.14), transparent 70%)',
          }}
        />
        <div className="sc-container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,0.92fr)', gap: 48, alignItems: 'center' }} id="hero-grid">
          <div className="sc-animate-in">
            <StatusChip label="AI-Powered Opportunity Verification" tone="primary" icon="sparkles" />
            <h1 style={{ fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em', margin: '20px 0 18px' }}>
              Before you apply.
              <br />
              <span style={{ color: 'var(--sc-primary)' }}>Before you pay.</span>
            </h1>
            <p style={{ fontSize: 17.5, color: 'var(--sc-text-secondary)', lineHeight: 1.65, maxWidth: 520, marginBottom: 30 }}>
              Verify internships, jobs, courses, and opportunities before they cost you your time, money, or trust. Paste a
              message or a link — ScamCheck explains what's actually risky, and why.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              <Button size="lg" icon="arrow-right" onClick={() => navigate('/analyze')}>
                Check an Opportunity
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </Button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--sc-text-muted)', marginRight: 4 }}>
                Verify:
              </span>
              {VERIFY_TAGS.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--sc-radius-full)',
                    background: 'var(--sc-surface)',
                    border: '1px solid var(--sc-border)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--sc-text-secondary)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="sc-animate-in" style={{ animationDelay: '120ms' }}>
            <PreviewCard />
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            #hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* --------------------------------------------------------- How it works */}
      <section id="how-it-works" style={{ padding: '88px 0' }}>
        <div className="sc-container">
          <ScrollReveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 14 }}>
              Three steps. Under a minute.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--sc-text-secondary)', lineHeight: 1.6 }}>
              No sign-up required to get a report. ScamCheck explains its reasoning in plain language, every time.
            </p>
          </ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} id="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 90}>
                <Card style={{ height: '100%' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--sc-primary-soft)',
                      color: 'var(--sc-primary)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Icon name={step.icon} size={19} />
                  </span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sc-text-muted)', marginBottom: 6 }}>STEP {i + 1}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--sc-text-secondary)', lineHeight: 1.6 }}>{step.body}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 860px) { #how-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* --------------------------------------------------------------- Features */}
      <section id="features" style={{ padding: '88px 0', background: 'var(--sc-surface)', borderTop: '1px solid var(--sc-border)', borderBottom: '1px solid var(--sc-border)' }}>
        <div className="sc-container">
          <ScrollReveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 14 }}>
              Every angle a scam hides behind
            </h2>
            <p style={{ fontSize: 16, color: 'var(--sc-text-secondary)', lineHeight: 1.6 }}>
              ScamCheck doesn't just say "safe" or "unsafe" — it shows you exactly what it checked.
            </p>
          </ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} id="feature-grid">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={(i % 3) * 80}>
                <Card hoverable style={{ height: '100%' }}>
                  <span
                    style={{
                      display: 'flex',
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: `var(--sc-${f.tone === 'neutral' ? 'surface-sunken' : f.tone + '-soft'})`,
                      color: `var(--sc-${f.tone === 'neutral' ? 'text-secondary' : f.tone})`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <Icon name={f.icon} size={18} />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', lineHeight: 1.6 }}>{f.body}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 860px) { #feature-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 560px) { #feature-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ---------------------------------------------------------- Evidence band */}
      <section id="evidence" style={{ padding: '88px 0' }}>
        <div className="sc-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 48, alignItems: 'center' }} id="evidence-grid">
          <ScrollReveal>
            <StatusChip label="Our philosophy" tone="primary" icon="sparkles" />
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, letterSpacing: '-0.01em', margin: '16px 0 16px' }}>
              Evidence before assumptions.
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--sc-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              ScamCheck never claims something is "verified" unless it's actually been checked against an outside source. A
              claim spotted in your message is labeled <strong>observed</strong>, not confirmed. When we genuinely can't tell,
              we say <strong>uncertain</strong> — never a guess dressed up as fact.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['check-circle', 'success', 'Verified — confirmed against an independent source'],
                ['eye', 'neutral', 'Observed — seen in your message, not yet confirmed'],
                ['help-circle', 'warning', 'Uncertain — could not be confirmed either way'],
                ['x-circle', 'danger', 'Contradicted — conflicts with an outside source'],
              ].map(([icon, tone, text]) => (
                <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `var(--sc-${tone === 'neutral' ? 'neutral-chip' : tone + '-soft'})`,
                      color: `var(--sc-${tone === 'neutral' ? 'text-secondary' : tone})`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={icon} size={13} />
                  </span>
                  <span style={{ color: 'var(--sc-text-secondary)' }}>{text}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <EvidenceMock />
          </ScrollReveal>
        </div>
        <style>{`@media (max-width: 900px) { #evidence-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* -------------------------------------------------------------------- CTA */}
      <section style={{ padding: '0 0 88px' }}>
        <div className="sc-container">
          <ScrollReveal
            style={{
              background: 'var(--sc-text)',
              borderRadius: 'var(--sc-radius-lg)',
              padding: '56px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(600px circle at 50% 0%, rgba(37,99,235,0.35), transparent 60%)',
              }}
            />
            <div style={{ position: 'relative' }}>
              <h2 style={{ color: '#fff', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, marginBottom: 12 }}>
                Got something in your inbox right now?
              </h2>
              <p style={{ color: 'rgba(248,250,252,0.75)', fontSize: 15.5, marginBottom: 28, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                Paste it into ScamCheck before you reply, apply, or pay anything.
              </p>
              <Button as={Link} to="/analyze" size="lg" icon="arrow-right" style={{ display: 'inline-flex' }}>
                Analyze an Opportunity
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

function PreviewCard() {
  return (
    <div
      style={{
        background: 'var(--sc-surface)',
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-lg)',
        boxShadow: 'var(--sc-shadow-lg)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ height: 4, background: 'var(--sc-danger)' }} />
      <div style={{ padding: '26px 26px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sc-text-muted)' }}>
                Internship Verification
              </span>
              <StatusChip label="Example" tone="neutral" size="sm" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>AI/ML Internship — XYZ Technologies</h3>
          </div>
          <StatusChip label="High risk" tone="danger" icon="alert-triangle" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--sc-border)', marginBottom: 20 }}>
          <RiskRing score={82} tone="danger" size={84} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Risk score
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--sc-danger)', fontWeight: 600, marginTop: 2 }}>Critical flags detected.</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {[
            ['alert-triangle', 'Upfront payment requested', 'Legitimate internships rarely ask for onboarding fees.'],
            ['clock', 'Urgency detected', 'Language creates artificial pressure to act immediately.'],
          ].map(([icon, title, body]) => (
            <div key={title} style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: 'var(--sc-danger)', flexShrink: 0, marginTop: 2 }}>
                <Icon name={icon} size={16} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--sc-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sc-text-muted)', marginBottom: 10 }}>
            Evidence summary
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatusChip label="Payment — contradicted" tone="danger" size="sm" />
            <StatusChip label="Organization — uncertain" tone="warning" size="sm" />
            <StatusChip label="Domain — verified" tone="success" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceMock() {
  const rows = [
    { claim: 'Payment requirement', status: 'CONTRADICTED', tone: 'danger', source: 'Official careers page states no fees required' },
    { claim: 'Organization identity', status: 'UNCERTAIN', tone: 'warning', source: 'Contact details differ from public records' },
    { claim: 'Website domain', status: 'VERIFIED', tone: 'success', source: 'Domain registration confirmed' },
  ];
  return (
    <Card style={{ boxShadow: 'var(--sc-shadow-md)' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        Example
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Evidence & verification</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map((row) => (
          <div key={row.claim} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--sc-border)' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{row.claim}</div>
              <div style={{ fontSize: 12.5, color: 'var(--sc-text-secondary)' }}>{row.source}</div>
            </div>
            <StatusChip label={row.status.replace('_', ' ')} tone={row.tone} size="sm" />
          </div>
        ))}
      </div>
    </Card>
  );
}
