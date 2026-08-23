import { useEffect, useRef, useState } from 'react';
import { toneColors } from './tone';

/** Horizontal Low→High gradient meter with an animated marker. */
export default function RiskMeter({ score = 0, tone = 'neutral' }) {
  const [width, setWidth] = useState(0);
  const frame = useRef();
  const colors = toneColors(tone);

  useEffect(() => {
    const target = Math.max(2, Math.min(100, score));
    const start = performance.now();
    const duration = 900;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setWidth(eased * target);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [score]);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          height: 10,
          borderRadius: 'var(--sc-radius-full)',
          background: 'linear-gradient(90deg, var(--sc-success-soft), var(--sc-warning-soft), var(--sc-danger-soft))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${width}%`,
            background: colors.fg,
            borderRadius: 'var(--sc-radius-full)',
            transition: 'background var(--sc-med) var(--sc-ease)',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, color: 'var(--sc-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <span>Low risk</span>
        <span>High risk</span>
      </div>
    </div>
  );
}
