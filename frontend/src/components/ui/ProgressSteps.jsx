import Icon from './Icon';

/** Presentational step tracker for the analyze-in-progress state. */
export default function ProgressSteps({ steps, activeIndex }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {steps.map((step, i) => {
        const state = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending';
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 4px' }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: state === 'done' ? 'var(--sc-success)' : state === 'active' ? 'var(--sc-primary)' : 'var(--sc-surface-sunken)',
                color: state === 'pending' ? 'var(--sc-text-muted)' : '#fff',
                transition: 'background var(--sc-fast) var(--sc-ease)',
              }}
            >
              {state === 'done' ? (
                <Icon name="check" size={13} strokeWidth={3} />
              ) : state === 'active' ? (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#fff',
                    animation: 'sc-pulse-ring 1.4s ease-out infinite',
                  }}
                />
              ) : (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              )}
            </span>
            <span
              style={{
                fontSize: 14.5,
                fontWeight: state === 'active' ? 700 : 500,
                color: state === 'pending' ? 'var(--sc-text-muted)' : 'var(--sc-text)',
                transition: 'color var(--sc-fast) var(--sc-ease)',
              }}
            >
              {step.label}
              {state === 'active' && '…'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
