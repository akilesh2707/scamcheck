import Icon from './Icon';
import { toneColors } from './tone';

export default function MetricCard({ icon, label, value, sublabel, tone = 'neutral', valueNode }) {
  const colors = toneColors(tone);
  return (
    <div
      style={{
        background: 'var(--sc-surface)',
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-md)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && (
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: colors.bg,
              color: colors.fg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={icon} size={15} />
          </span>
        )}
        <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--sc-text-muted)' }}>
          {label}
        </span>
      </div>
      {valueNode || (
        <span style={{ fontSize: 26, fontWeight: 800, color: colors.fg, lineHeight: 1 }}>{value}</span>
      )}
      {sublabel && <span style={{ fontSize: 12.5, color: 'var(--sc-text-secondary)' }}>{sublabel}</span>}
    </div>
  );
}
