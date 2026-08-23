import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/history');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sc-container" style={{ padding: '64px 24px 96px', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ maxWidth: 420, width: '100%' }} className="sc-animate-in">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--sc-primary-soft)',
              color: 'var(--sc-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Icon name="log-in" size={20} />
          </span>
          <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)' }}>Sign in to view your saved analysis history.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required icon="mail" />
          <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required icon="lock" />

          {error && (
            <p role="alert" style={{ color: 'var(--sc-danger)', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="alert-triangle" size={14} /> {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} icon="arrow-right">
            Sign in
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--sc-text-secondary)', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--sc-primary)', fontWeight: 700 }}>
            Create one
          </Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--sc-text-muted)', marginTop: 8 }}>
          You can analyze opportunities without an account — sign in only saves your history.
        </p>
      </Card>
    </div>
  );
}

export function Field({ label, type = 'text', value, onChange, autoComplete, required, icon }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <Icon name={icon} size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--sc-text-muted)' }} />
        )}
        <input
          className="sc-input"
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: icon ? '12px 14px 12px 40px' : '12px 14px',
            border: '1px solid var(--sc-border)',
            borderRadius: 'var(--sc-radius-sm)',
            fontSize: 14,
            fontFamily: 'inherit',
            background: 'var(--sc-surface-sunken)',
            color: 'var(--sc-text)',
          }}
        />
      </div>
    </div>
  );
}
