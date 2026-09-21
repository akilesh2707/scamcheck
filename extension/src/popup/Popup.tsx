import { useState, useEffect } from 'react';
import { analyzePageText, analyzeImage, exchangePairingCode, setAuthToken } from '../api/scamcheck-api';
import type { AnalysisReport } from '../types/analysis';
import './popup.css';

export function Popup() {
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [pageData, setPageData] = useState<{ url: string; title: string; text: string } | null>(null);
  const [pendingSelection, setPendingSelection] = useState<{ text: string; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [pairingCode, setPairingCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth
    chrome.storage.local.get(['scamcheck_token', 'pendingSelection'], (result) => {
      if (result.scamcheck_token) {
        setAuthToken(result.scamcheck_token as string);
        setIsAuthenticated(true);
      }
      
      // Check for pending selection from context menu
      if (result.pendingSelection) {
        setPendingSelection(result.pendingSelection as { text: string; url: string });
        // Clear it so it doesn't persist forever
        chrome.storage.local.remove('pendingSelection');
        chrome.action.setBadgeText({ text: '' });
      }
    });

    // Extract page info on load
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: () => {
              const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();
              
              // Phase 3G: Enhanced Generic Page Extraction
              let structuredContext = '';
              try {
                const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
                const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
                const ogSite = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
                
                if (ogTitle) structuredContext += `[Title: ${ogTitle}]\n`;
                if (ogSite) structuredContext += `[Organization: ${ogSite}]\n`;
                if (ogDesc) structuredContext += `[Description: ${ogDesc}]\n`;

                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                for (const script of scripts) {
                  try {
                    const json = JSON.parse(script.textContent || '');
                    if (json['@type'] === 'JobPosting' || json['@type'] === 'Course') {
                      if (json.title) structuredContext += `[Structured Title: ${json.title}]\n`;
                      if (json.hiringOrganization?.name) structuredContext += `[Structured Org: ${json.hiringOrganization.name}]\n`;
                    }
                  } catch { }
                }
              } catch { }

              let visibleText = document.body ? document.body.innerText : '';
              visibleText = normalizeWhitespace(visibleText);
              
              const combinedText = (structuredContext + '\n' + visibleText).trim();

              if (combinedText.length > 10000) {
                return { url: window.location.href, title: document.title, text: combinedText.substring(0, 10000) };
              }
              return { url: window.location.href, title: document.title, text: combinedText };
            }
          },
          (results: chrome.scripting.InjectionResult<any>[]) => {
            if (chrome.runtime.lastError) {
              setError(`Cannot access this page: ${chrome.runtime.lastError.message}`);
              return;
            }
            if (results && results[0] && results[0].result) {
              setPageData(results[0].result);
            }
          }
        );
      }
    });
  }, []);

  const handleAnalyzeText = async (text: string) => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await analyzePageText(text);
      setReport(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
      setPendingSelection(null);
    }
  };

  const handleScreenshotAnalyze = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 80 }, async (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          setError('Failed to capture screenshot. Make sure you are on a valid webpage.');
          setLoading(false);
          return;
        }

        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          
          if (blob.size > 5 * 1024 * 1024) {
            setError('Screenshot is too large to analyze safely.');
            setLoading(false);
            return;
          }

          const result = await analyzeImage(blob);
          setReport(result);
        } catch (err: any) {
          setError(err.message || 'Error processing screenshot.');
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setError('Cannot capture screen.');
      setLoading(false);
    }
  };

  const handlePairing = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const token = await exchangePairingCode(pairingCode);
      chrome.storage.local.set({ scamcheck_token: token });
      setAuthToken(token);
      setIsAuthenticated(true);
      setView('main');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid pairing code');
    }
  };

  const handleLogout = () => {
    chrome.storage.local.remove('scamcheck_token');
    setAuthToken('');
    setIsAuthenticated(false);
  };

  const truncateString = (str: string, num: number) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const getEvidenceColor = (status: string) => {
    switch (status) {
      case 'SUPPORTED': return '#166534';
      case 'CONTRADICTED': return '#991b1b';
      case 'NOT_VERIFIED': return '#854d0e';
      case 'UNAVAILABLE': return '#6b7280';
      case 'INFERRED': return '#1d4ed8';
      default: return '#374151';
    }
  };

  const WEB_URL = import.meta.env.VITE_SCAMCHECK_WEB_URL || 'http://localhost:3000';

  if (view === 'settings') {
    return (
      <div className="popup-container">
        <header className="popup-header settings-header">
          <button className="back-btn" onClick={() => setView('main')}>← Back</button>
          <h1>Settings</h1>
        </header>
        <div className="popup-content">
          {isAuthenticated ? (
            <div className="auth-section">
              <p>✅ Connected to ScamCheck</p>
              <button className="btn-secondary" onClick={handleLogout}>Disconnect Account</button>
            </div>
          ) : (
            <div className="auth-section">
              <p>Connect your ScamCheck account to enable personalized suitability scoring.</p>
              <a href={`${WEB_URL}/connect-extension`} target="_blank" rel="noopener noreferrer" className="btn-primary link-btn">
                Get Pairing Code
              </a>
              <form onSubmit={handlePairing} className="pairing-form">
                <input 
                  type="text" 
                  value={pairingCode} 
                  onChange={e => setPairingCode(e.target.value)} 
                  placeholder="Enter 6-digit code" 
                  maxLength={6}
                  required
                />
                <button type="submit" className="btn-primary">Pair Extension</button>
              </form>
              {authError && <p className="error-text">{authError}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>ScamCheck</h1>
        <button className="settings-btn" onClick={() => setView('settings')}>⚙️</button>
      </header>
      
      <div className="popup-content">
        {!pageData && !error && <p>Loading page context...</p>}
        
        {pageData && !report && !loading && (
          <div className="page-context">
            {pendingSelection ? (
              <div className="selection-card">
                <p><strong>Pending Selection:</strong></p>
                <p className="selection-text">"{truncateString(pendingSelection.text, 60)}"</p>
                <button className="btn-primary" onClick={() => handleAnalyzeText(pendingSelection.text)}>
                  Analyze Selected Text
                </button>
                <button className="btn-secondary" onClick={() => setPendingSelection(null)}>Clear Selection</button>
              </div>
            ) : (
              <>
                <p className="page-title">{truncateString(pageData.title, 50)}</p>
                <button className="btn-primary" onClick={() => handleAnalyzeText(pageData.text)}>
                  Analyze Current Page
                </button>
                <button className="btn-secondary" onClick={handleScreenshotAnalyze}>
                  Analyze Visible Screen
                </button>
              </>
            )}
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-text">{error}</p>
            {pageData ? (
              <button className="btn-secondary" onClick={() => setError(null)}>Go Back</button>
            ) : (
              <button className="btn-secondary" onClick={() => window.close()}>Close</button>
            )}
          </div>
        )}

        {report && (
          <div className="report-summary">
            <div className="report-card">
              <h3>{report.opportunity.type || 'Opportunity'}</h3>
              <div className={`risk-badge risk-${report.risk.level.toLowerCase()}`}>
                Risk Level: {report.risk.level === 'UNKNOWN' ? 'UNAVAILABLE' : report.risk.level}
              </div>
              <p className="decision-text">{report.recommendation.decision.replace(/_/g, ' ')}</p>
            </div>
            
            <div className="report-section">
              <h4>Suitability</h4>
              <p style={{ color: getEvidenceColor(report.suitability?.status || 'UNAVAILABLE'), fontWeight: 'bold' }}>
                {report.suitability?.status === 'INSUFFICIENT_PROFILE_DATA' ? 'NOT CONFIGURED' : report.suitability?.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : report.suitability?.status}
              </p>
            </div>

            {report.payment && (
              <div className="report-section">
                <h4>Payment Required</h4>
                <p style={{ fontWeight: 'bold', color: report.payment.required ? '#dc2626' : report.payment.required === false ? '#16a34a' : '#6b7280' }}>
                  {report.payment.required === true
                    ? `Yes${report.payment.amount != null ? ` (${report.payment.currency === 'USD' ? '$' : '₹'}${report.payment.amount})` : ''}`
                    : report.payment.required === false
                    ? 'No'
                    : 'Unavailable'}
                </p>
              </div>
            )}

            {report.credibility?.score != null && (
              <div className="report-section">
                <h4>Credibility</h4>
                <p style={{ fontWeight: 'bold', color: report.credibility.score >= 70 ? '#16a34a' : report.credibility.score >= 40 ? '#ca8a04' : '#dc2626' }}>
                  {report.credibility.score}/100
                </p>
              </div>
            )}

            <div className="report-actions">
              <a href={`${WEB_URL}/report/${report.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary link-btn">
                View Full Report
              </a>
              <button className="btn-secondary" onClick={() => setReport(null)}>Analyze Another</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
