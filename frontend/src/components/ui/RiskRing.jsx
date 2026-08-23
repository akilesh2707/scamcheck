import { useEffect, useRef, useState } from 'react';
import { toneColors } from './tone';

/**
 * Animated circular risk score. Score counts up and the ring draws in on
 * mount/update — the one "wow" moment of the report page.
 */
export default function RiskRing({ score = 0, tone = 'neutral', size = 132, label, sublabel }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();
  const colors = toneColors(tone);

  useEffect(() => {
    const target = Math.max(0, Math.min(100, Math.round(score)));
    const start = performance.now();
    const duration = 1100;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [score]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div
      style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}
      role="img"
      aria-label={`${label || 'Risk score'}: ${Math.round(score)} out of 100`}
    >
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--sc-surface-sunken)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={colors.fg}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: size > 110 ? 32 : 24, fontWeight: 800, color: colors.fg, lineHeight: 1 }}>{display}</span>
        {sublabel && (
          <span style={{ fontSize: 11, color: 'var(--sc-text-muted)', marginTop: 4, fontWeight: 600 }}>{sublabel}</span>
        )}
      </div>
    </div>
  );
}
