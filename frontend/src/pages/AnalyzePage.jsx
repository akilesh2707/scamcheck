import { useState } from 'react';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import StatusChip from '../components/ui/StatusChip';
import ProgressSteps from '../components/ui/ProgressSteps';
import ErrorState from '../components/ui/ErrorState';
import ScrollReveal from '../components/ui/ScrollReveal';
import { useAnalyze, ANALYSIS_STEPS } from '../hooks/useAnalyze';
import { isValidUrl } from '../services/api';
import { EXAMPLES } from '../utils/examples';

const TABS = [
  { key: 'text', label: 'Paste Text', icon: 'file-text' },
  { key: 'url', label: 'Website URL', icon: 'link' },
  { key: 'screenshot', label: 'Upload Screenshot', icon: 'image' },
];

const REPORT_INCLUDES = [
  { icon: 'alert-triangle', label: 'Risk assessment', tone: 'danger' },
  { icon: 'shield-check', label: 'Credibility signals', tone: 'primary' },
  { icon: 'credit-card', label: 'Payment check', tone: 'warning' },
  { icon: 'file-text', label: 'Evidence & sources', tone: 'neutral' },
];

const ANALYSIS_GRID = [
  { icon: 'alert-triangle', title: 'Risk', body: 'Identifies common scam patterns and coercive language.' },
  { icon: 'shield-check', title: 'Credibility', body: "Checks the organization's website and identity signals." },
  { icon: 'credit-card', title: 'Payment', body: 'Analyzes requests for upfront fees or unusual payment methods.' },
  { icon: 'target', title: 'Suitability', body: 'Evaluates whether the offer matches your skills and goals.' },
  { icon: 'compass', title: 'Alternatives', body: 'Suggests safer, verified paths to a similar outcome.' },
  { icon: 'file-text', title: 'Evidence', body: 'Highlights specific phrases or missing information as proof.' },
];

export default function AnalyzePage() {
  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const { status, stepIndex, error, run, reset } = useAnalyze();

  const charLimit = 5000;
  const isLoading = status === 'loading';

  function handleExample(example) {
    setTab('text');
    setText(example.text);
    setValidationError(null);
    setFile(null);
    setFilePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError(null);

    if (tab === 'text') {
      if (!text.trim()) {
        setValidationError('Paste an opportunity message before analyzing.');
        return;
      }
      try {
        await run({ type: 'text', value: text.trim() });
      } catch {
        /* surfaced via error state */
      }
      return;
    }

    if (tab === 'url') {
      if (!url.trim()) {
        setValidationError('Enter a website URL to analyze.');
        return;
      }
      if (!isValidUrl(url)) {
        setValidationError('Enter a valid URL, e.g. https://example.com');
        return;
      }
      try {
        await run({ type: 'url', value: url.trim() });
      } catch {
        /* surfaced via error state */
      }
      return;
    }

    if (tab === 'screenshot') {
      if (!file) {
        setValidationError('Please select or drag an image to upload.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('File is too large. Maximum size is 5MB.');
        return;
      }
      try {
        await run({ type: 'screenshot', value: file });
      } catch {
        /* surfaced via error state */
      }
    }
  }

  if (isLoading) {
    return <AnalyzingState stepIndex={stepIndex} />;
  }

  return (
    <div className="sc-container" style={{ padding: '56px 24px 96px' }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }} className="sc-animate-in">
        <StatusChip label="Opportunity verification" tone="primary" icon="sparkles" />
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '18px 0 14px' }}>
          Check an opportunity before you trust it.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--sc-text-secondary)', lineHeight: 1.6 }}>
          Paste the details of a job, internship, course, certification, or online opportunity — or a website link. ScamCheck
          explains exactly what to verify.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }} id="analyze-grid">
        <Card padded={false} className="sc-animate-in" style={{ overflow: 'hidden', animationDelay: '80ms' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--sc-border)', background: 'var(--sc-surface-sunken)' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                data-active={tab === t.key}
                onClick={() => {
                  setTab(t.key);
                  setValidationError(null);
                  reset();
                }}
                className="sc-tab-btn"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px 8px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--sc-text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 24 }}>
            <label htmlFor="opportunity-input" style={{ fontSize: 13, fontWeight: 700, color: 'var(--sc-text)', display: 'block', marginBottom: 10 }}>
              {tab === 'text' ? 'Opportunity details' : tab === 'url' ? 'Website URL' : 'Upload an image'}
            </label>

            {tab === 'text' ? (
              <textarea
                id="opportunity-input"
                className="sc-textarea"
                value={text}
                maxLength={charLimit}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the job, internship, course, or opportunity message here…"
                style={{
                  width: '100%',
                  height: 220,
                  padding: 16,
                  background: 'var(--sc-surface-sunken)',
                  border: '1px solid var(--sc-border)',
                  borderRadius: 'var(--sc-radius-sm)',
                  fontSize: 14.5,
                  fontFamily: 'inherit',
                  color: 'var(--sc-text)',
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
              />
            ) : tab === 'url' ? (
              <div style={{ position: 'relative' }}>
                <Icon
                  name="link"
                  size={16}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sc-text-muted)' }}
                />
                <input
                  id="opportunity-input"
                  className="sc-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/internship-offer"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 40px',
                    background: 'var(--sc-surface-sunken)',
                    border: '1px solid var(--sc-border)',
                    borderRadius: 'var(--sc-radius-sm)',
                    fontSize: 14.5,
                    fontFamily: 'inherit',
                    color: 'var(--sc-text)',
                  }}
                />
                <p style={{ fontSize: 12.5, color: 'var(--sc-text-muted)', marginTop: 10 }}>
                  We fetch the page safely server-side. Private or internal network addresses are always blocked.
                </p>
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  minHeight: 220,
                  padding: 16,
                  background: 'var(--sc-surface-sunken)',
                  border: '1px dashed var(--sc-border)',
                  borderRadius: 'var(--sc-radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {filePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={filePreview} alt="Upload preview" style={{ maxHeight: 160, objectFit: 'contain', borderRadius: 'var(--sc-radius-sm)', border: '1px solid var(--sc-border)' }} />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setFilePreview(null); }}
                      style={{ marginTop: 12, background: 'transparent', color: 'var(--sc-danger)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <>
                    <Icon name="image" size={32} style={{ color: 'var(--sc-text-muted)', marginBottom: 12 }} />
                    <p style={{ fontSize: 14.5, color: 'var(--sc-text)', fontWeight: 600, marginBottom: 4 }}>
                      Drag and drop a screenshot here
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--sc-text-muted)', marginBottom: 16 }}>
                      or click to browse your files (PNG, JPG up to 5MB)
                    </p>
                    <label
                      htmlFor="screenshot-upload"
                      style={{
                        padding: '8px 16px',
                        background: 'var(--sc-surface)',
                        border: '1px solid var(--sc-border)',
                        borderRadius: 'var(--sc-radius-full)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--sc-text)',
                        cursor: 'pointer'
                      }}
                    >
                      Browse Files
                    </label>
                    <input
                      id="screenshot-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setFile(f);
                          setFilePreview(URL.createObjectURL(f));
                          setValidationError(null);
                        }
                      }}
                    />
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 12.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="shield-check" size={13} /> You control when an opportunity is analyzed.
              </span>
              {tab === 'text' && (
                <span style={{ fontSize: 12, color: 'var(--sc-text-muted)' }}>
                  {text.length} / {charLimit} chars
                </span>
              )}
            </div>

            {validationError && (
              <p role="alert" style={{ color: 'var(--sc-danger)', fontSize: 13.5, marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="alert-triangle" size={14} /> {validationError}
              </p>
            )}

            {status === 'error' && (
              <div style={{ marginTop: 16 }}>
                <ErrorState error={error} compact />
              </div>
            )}

            <Button type="submit" size="lg" icon="arrow-right" style={{ marginTop: 20, width: '100%' }}>
              Analyze Opportunity
            </Button>
          </form>

          <div style={{ padding: '0 24px 24px' }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Try an example
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleExample(ex)}
                  className="sc-example-chip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--sc-radius-full)',
                    border: '1px solid var(--sc-border)',
                    background: 'var(--sc-surface)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--sc-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name={ex.icon} size={13} />
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="sc-animate-in" style={{ animationDelay: '160ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Icon name="activity" size={18} />
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Your verification report will include</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REPORT_INCLUDES.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  border: '1px solid var(--sc-border)',
                  borderRadius: 'var(--sc-radius-sm)',
                  background: 'var(--sc-surface-sunken)',
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: `var(--sc-${item.tone}-soft)`,
                    color: `var(--sc-${item.tone})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={item.icon} size={15} />
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--sc-text-muted)', marginTop: 18, textAlign: 'center' }}>
            Analysis usually takes a few seconds.
          </p>
        </Card>
      </div>

      <style>{`@media (max-width: 900px) { #analyze-grid { grid-template-columns: 1fr !important; } }`}</style>

      <section style={{ marginTop: 72 }}>
        <ScrollReveal>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Comprehensive analysis</h2>
        </ScrollReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} id="comp-grid">
          {ANALYSIS_GRID.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 60}>
              <Card hoverable>
                <Icon name={item.icon} size={20} style={{ marginBottom: 12, color: 'var(--sc-primary)' }} />
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', lineHeight: 1.6 }}>{item.body}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
        <style>{`@media (max-width: 860px) { #comp-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 560px) { #comp-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>
    </div>
  );
}

function AnalyzingState({ stepIndex }) {
  return (
    <div className="sc-container" style={{ padding: '96px 24px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }} className="sc-animate-in">
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'var(--sc-primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid var(--sc-primary-soft-border)',
              borderTopColor: 'var(--sc-primary)',
              animation: 'sc-spin 1s linear infinite',
            }}
          />
          <Icon name="shield-check" size={30} style={{ color: 'var(--sc-primary)' }} />
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 8 }}>Analyzing opportunity…</h2>
        <p style={{ fontSize: 14, color: 'var(--sc-text-secondary)', marginBottom: 28 }}>
          This usually takes just a few seconds.
        </p>
        <Card style={{ textAlign: 'left' }}>
          <ProgressSteps steps={ANALYSIS_STEPS} activeIndex={stepIndex} />
        </Card>
      </div>
    </div>
  );
}
