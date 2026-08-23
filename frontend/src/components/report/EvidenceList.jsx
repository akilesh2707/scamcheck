import Icon from '../ui/Icon';
import StatusChip from '../ui/StatusChip';
import { evidenceInfo } from '../../utils/format';
import Reveal from '../ui/Reveal';

/**
 * Renders a list of Evidence { claim, status, details, source } items.
 * This is the one place in the app that shows raw evidence status —
 * always with its tone-appropriate label, never implying more certainty
 * than the backend actually returned.
 */
export default function EvidenceList({ items, emptyLabel = 'No evidence recorded for this section.' }) {
  const filtered = (items || []).filter((e) => e && e.claim);

  if (filtered.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="minus-circle" size={15} /> {emptyLabel}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {filtered.map((item, i) => {
        const info = evidenceInfo(item.status);
        return (
          <Reveal
            key={`${item.claim}-${i}`}
            delay={i * 50}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 14,
              padding: '14px 0',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--sc-border)' : 'none',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--sc-text)', marginBottom: 3 }}>{item.claim}</div>
              {item.details && (
                <div style={{ fontSize: 12.5, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>{item.details}</div>
              )}
              {item.source && (
                <div style={{ fontSize: 12, color: 'var(--sc-text-muted)', marginTop: 2 }}>Source: {item.source}</div>
              )}
            </div>
            <StatusChip label={info.label} tone={info.tone} icon={info.icon} size="sm" />
          </Reveal>
        );
      })}
    </div>
  );
}
