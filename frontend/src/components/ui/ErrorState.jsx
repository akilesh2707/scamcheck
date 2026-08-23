import Icon from './Icon';
import Button from './Button';
import { toneColors } from './tone';

const ICONS = {
  NETWORK_ERROR: 'ban',
  TIMEOUT: 'clock',
  RATE_LIMIT_EXCEEDED: 'clock',
  UNAUTHORIZED: 'lock',
  NOT_FOUND: 'search',
  INVALID_INPUT: 'alert-triangle',
  NOT_IMPLEMENTED: 'info',
};

/** Renders a normalized ApiError with a friendly message — never a stack trace. */
export default function ErrorState({ error, onRetry, compact = false }) {
  const code = error?.code || 'UNKNOWN_ERROR';
  const icon = ICONS[code] || 'alert-triangle';
  const colors = toneColors('danger');
  const message = error?.message || 'Something went wrong. Please try again.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: compact ? 'center' : 'center',
        textAlign: compact ? 'left' : 'center',
        gap: compact ? 14 : 16,
        padding: compact ? '16px 20px' : '48px 24px',
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        borderRadius: 'var(--sc-radius-md)',
      }}
    >
      <div
        style={{
          width: compact ? 36 : 52,
          height: compact ? 36 : 52,
          borderRadius: '50%',
          background: 'var(--sc-surface)',
          color: colors.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={compact ? 18 : 24} />
      </div>
      <div style={{ flex: 1 }}>
        {!compact && <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: 'var(--sc-text)' }}>We hit a snag</h3>}
        <p style={{ fontSize: 14, color: 'var(--sc-text-secondary)', lineHeight: 1.6, margin: 0 }}>{message}</p>
        {error?.retryAfter && (
          <p style={{ fontSize: 12.5, color: 'var(--sc-text-muted)', marginTop: 4 }}>Try again in about {error.retryAfter}s.</p>
        )}
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" icon="refresh-cw" onClick={onRetry} style={{ flexShrink: 0 }}>
          Try again
        </Button>
      )}
    </div>
  );
}
