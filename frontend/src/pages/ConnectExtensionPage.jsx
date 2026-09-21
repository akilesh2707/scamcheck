import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Navigate } from 'react-router-dom';

export default function ConnectExtensionPage() {
  const { isAuthenticated, ready } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getExtensionCode();
      setCode(res.code);
    } catch (err) {
      setError(err.message || 'Failed to generate pairing code');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && isAuthenticated && !code && !loading) {
      generateCode();
    }
  }, [ready, isAuthenticated, code, loading, generateCode]);

  if (!ready) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/connect-extension' }} />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Connect Browser Extension</h1>
        <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>Pair your browser extension securely with your ScamCheck account.</p>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        textAlign: 'center', 
        padding: '3rem 2rem',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Your Pairing Code</h2>
        <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
          Enter this one-time code into the ScamCheck browser extension to link your account. 
          This code expires in 5 minutes.
        </p>

        {loading ? (
          <p>Generating secure code...</p>
        ) : error ? (
          <div>
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button 
              onClick={generateCode} 
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        ) : code ? (
          <div>
            <div 
              style={{ 
                fontSize: '2.5rem', 
                letterSpacing: '8px', 
                fontWeight: 'bold', 
                background: '#f3f4f6', 
                padding: '1.5rem', 
                borderRadius: '8px',
                display: 'inline-block',
                marginBottom: '1rem',
                userSelect: 'all'
              }}
            >
              {code}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Return to the extension and paste this code.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
