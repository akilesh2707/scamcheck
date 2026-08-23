import Icon from './Icon';
import Button from './Button';

export default function EmptyState({ icon = 'search', title, description, actionLabel, onAction, actionTo }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '56px 24px',
        border: '1px dashed var(--sc-border-strong)',
        borderRadius: 'var(--sc-radius-md)',
        background: 'var(--sc-surface)',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--sc-surface-sunken)',
          color: 'var(--sc-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Icon name={icon} size={26} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 14.5, color: 'var(--sc-text-secondary)', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {actionLabel && (
        <Button as={actionTo ? 'a' : 'button'} href={actionTo} onClick={onAction} variant="primary" size="sm" style={{ display: 'inline-flex' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
