export default function ProgressBar({ label, value, tone = 'primary' }) {
  if (value == null) return null;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
        <span style={{ color: 'var(--sc-text-secondary)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 700, color: `var(--sc-${tone})` }}>{pct}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 'var(--sc-radius-full)', background: 'var(--sc-surface-sunken)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: `var(--sc-${tone})`,
            borderRadius: 'var(--sc-radius-full)',
            transition: 'width 900ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </div>
    </div>
  );
}
