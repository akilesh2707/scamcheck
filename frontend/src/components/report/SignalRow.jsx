import Icon from '../ui/Icon';
import { toneColors } from '../ui/tone';

/**
 * A single credibility/checklist signal: "HTTPS — Detected". Used for
 * website + company signal checklists. `known` distinguishes "we checked
 * and it's false" (still informative) from "we don't know."
 */
export default function SignalRow({ label, value, trueLabel = 'Detected', falseLabel = 'Not detected', unknownLabel = 'Needs verification' }) {
  let tone = 'neutral';
  let text = unknownLabel;
  let icon = 'help-circle';

  if (value === true) {
    tone = 'success';
    text = trueLabel;
    icon = 'check-circle';
  } else if (value === false) {
    tone = 'warning';
    text = falseLabel;
    icon = 'help-circle';
  }

  const colors = toneColors(tone);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 0',
        borderBottom: '1px solid var(--sc-border)',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', fontWeight: 600 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.fg, fontSize: 13, fontWeight: 700 }}>
        <Icon name={icon} size={14} />
        {text}
      </span>
    </div>
  );
}
