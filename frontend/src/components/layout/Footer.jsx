import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--sc-border)', background: 'var(--sc-surface)', marginTop: 'auto' }}>
      <div
        className="sc-container"
        style={{
          padding: '48px 24px 32px',
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 1.4fr) repeat(3, 1fr)',
          gap: 32,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 17, marginBottom: 10 }}>
            <Icon name="shield-check" size={18} />
            ScamCheck
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--sc-text-muted)', lineHeight: 1.6, maxWidth: 260 }}>
            Before you apply. Before you pay. Built by Team Ultron for Hackspora 2.0.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: 'Analyze an opportunity', to: '/analyze' },
            { label: 'History', to: '/history' },
          ]}
        />
        <FooterCol
          title="How it works"
          links={[
            { label: 'Risk detection', to: '/#risk' },
            { label: 'Evidence & credibility', to: '/#evidence' },
            { label: 'Payment verification', to: '/#payment' },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { label: 'Sign in', to: '/login' },
            { label: 'Create account', to: '/register' },
          ]}
        />
      </div>
      <div style={{ borderTop: '1px solid var(--sc-border)', padding: '18px 24px' }}>
        <div className="sc-container" style={{ padding: 0, fontSize: 12.5, color: 'var(--sc-text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>&copy; {new Date().getFullYear()} ScamCheck. All rights reserved.</span>
          <span>Evidence-based analysis — not legal or financial advice.</span>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          footer > .sc-container { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--sc-text)', marginBottom: 14 }}>
        {title}
      </h4>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} style={{ fontSize: 13.5, color: 'var(--sc-text-muted)' }}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
