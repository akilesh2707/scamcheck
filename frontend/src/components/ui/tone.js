// Shared tone -> color tokens so every component (chips, rings, borders,
// icons) agrees on what "danger" or "success" looks like.
export const TONE_COLORS = {
  success: {
    fg: 'var(--sc-success)',
    bg: 'var(--sc-success-soft)',
    border: 'var(--sc-success-border)',
  },
  warning: {
    fg: 'var(--sc-warning)',
    bg: 'var(--sc-warning-soft)',
    border: 'var(--sc-warning-border)',
  },
  danger: {
    fg: 'var(--sc-danger)',
    bg: 'var(--sc-danger-soft)',
    border: 'var(--sc-danger-border)',
  },
  primary: {
    fg: 'var(--sc-primary)',
    bg: 'var(--sc-primary-soft)',
    border: 'var(--sc-primary-soft-border)',
  },
  neutral: {
    fg: 'var(--sc-text-secondary)',
    bg: 'var(--sc-neutral-chip)',
    border: 'var(--sc-border)',
  },
};

export function toneColors(tone) {
  return TONE_COLORS[tone] || TONE_COLORS.neutral;
}
