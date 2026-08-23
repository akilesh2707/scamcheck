import Icon from './Icon';
import { toneColors } from './tone';

/**
 * A pill-shaped status label. This is the single visual vocabulary used for
 * risk levels, evidence states, payment states, and recommendations — so a
 * user learns the color language once and it holds everywhere.
 */
export default function StatusChip({ label, tone = 'neutral', icon, size = 'md', outline = false }) {
  const colors = toneColors(tone);
  const padding = size === 'sm' ? '3px 10px' : '6px 14px';
  const fontSize = size === 'sm' ? '11px' : '12.5px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        borderRadius: 'var(--sc-radius-full)',
        background: outline ? 'transparent' : colors.bg,
        color: colors.fg,
        border: `1px solid ${outline ? colors.fg : colors.border}`,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 12 : 14} />}
      {label}
    </span>
  );
}
