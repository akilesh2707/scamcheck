import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/analyze', label: 'Analyze' },
  { to: '/history', label: 'History' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(248, 250, 252, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${scrolled ? 'var(--sc-border)' : 'transparent'}`,
        transition: 'border-color var(--sc-fast) var(--sc-ease)',
      }}
    >
      <div className="sc-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'var(--sc-text)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="shield-check" size={17} />
          </span>
          ScamCheck
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 34 }} className="sc-nav-desktop">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="sc-nav-link"
              style={({ isActive }) => ({
                fontSize: 14.5,
                fontWeight: 600,
                color: isActive ? 'var(--sc-text)' : 'var(--sc-text-secondary)',
              })}
              data-active={undefined}
            >
              {({ isActive }) => (
                <span data-active={isActive} className="sc-nav-link">
                  {link.label}
                </span>
              )}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/profile"
              className="sc-nav-link"
              style={({ isActive }) => ({
                fontSize: 14.5,
                fontWeight: 600,
                color: isActive ? 'var(--sc-text)' : 'var(--sc-text-secondary)',
              })}
            >
              {({ isActive }) => (
                <span data-active={isActive} className="sc-nav-link">
                  Profile
                </span>
              )}
            </NavLink>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="sc-nav-actions">
          {user ? (
            <>
              <span style={{ fontSize: 13.5, color: 'var(--sc-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="user" size={14} /> {user.name || user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon="logout"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button as={Link} to="/login" variant="ghost" size="sm">
              Sign in
            </Button>
          )}
          <Button as={Link} to="/analyze" variant="primary" size="sm" icon="arrow-right">
            Analyze
          </Button>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="sc-nav-toggle"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid var(--sc-border)',
              borderRadius: 8,
              width: 38,
              height: 38,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sc-text)',
            }}
          >
            <Icon name={open ? 'x' : 'menu'} size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--sc-border)', background: 'var(--sc-surface)' }} className="sc-nav-mobile">
          <div className="sc-container" style={{ display: 'flex', flexDirection: 'column', padding: '12px 24px 20px', gap: 4 }}>
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                style={{ padding: '12px 4px', fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', borderBottom: '1px solid var(--sc-border)' }}
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                style={{ padding: '12px 4px', fontSize: 15, fontWeight: 600, color: 'var(--sc-text)', borderBottom: '1px solid var(--sc-border)' }}
              >
                Profile
              </NavLink>
            )}
            {!user && (
              <NavLink to="/login" onClick={() => setOpen(false)} style={{ padding: '12px 4px', fontSize: 15, fontWeight: 600, color: 'var(--sc-text)' }}>
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .sc-nav-desktop { display: none !important; }
          .sc-nav-actions > span, .sc-nav-actions > .sc-btn-ghost:not(.sc-nav-toggle) { display: none !important; }
          .sc-nav-toggle { display: inline-flex !important; }
        }
        @media (min-width: 861px) {
          .sc-nav-mobile { display: none; }
        }
      `}</style>
    </header>
  );
}
