import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { Field } from './LoginPage';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      navigate('/history');
    } catch (err) {
      setError(err.message || 'Unable to create your account.');
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
            <Icon name="user" size={20} />
          </span>
          <h1 style={{ fontSize: 21, fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)' }}>Save your analysis history and revisit reports anytime.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Name (optional)" value={name} onChange={setName} autoComplete="name" icon="user" />
          <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required icon="mail" />
          <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required icon="lock" />
          <p style={{ fontSize: 12, color: 'var(--sc-text-muted)', marginTop: -8, marginBottom: 16 }}>
            At least 8 characters, with an uppercase letter, a number, and a symbol.
          </p>

          {error && (
            <p role="alert" style={{ color: 'var(--sc-danger)', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="alert-triangle" size={14} /> {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading} icon="arrow-right">
            Create account
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--sc-text-secondary)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--sc-primary)', fontWeight: 700 }}>
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
