import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="sc-container" style={{ padding: '100px 24px', textAlign: 'center' }}>
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--sc-surface-sunken)',
          color: 'var(--sc-text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon name="compass" size={28} />
      </span>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Page not found</h1>
      <p style={{ fontSize: 15, color: 'var(--sc-text-secondary)', marginBottom: 24 }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/" icon="arrow-right" style={{ display: 'inline-flex' }}>
        Back to home
      </Button>
    </div>
  );
}
