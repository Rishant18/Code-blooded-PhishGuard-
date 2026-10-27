import React, { useEffect, useState, useMemo } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/* ==========================================================================
   Inline SVG Icons
   ========================================================================== */
function ShieldIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ShieldAlertIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function AlertTriangleIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircleIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function UploadIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileTextIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function ClockIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SearchIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TrashIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ChevronDownIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MailIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ActivityIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function DatabaseIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function ZapIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function DownloadIcon({ className = '', size = 18 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon({ className = '', size = 16 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/* ==========================================================================
   Helper Functions
   ========================================================================== */
function formatDate(value) {
  if (!value) return 'Unknown timestamp';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function categorizeIndicators(indicators = []) {
  const categories = { header: [], url: [], body: [], reputation: [] };
  indicators.forEach((ind) => {
    if (ind.pillar === 'Reputation') {
      categories.reputation.push(ind);
    } else {
      const text = `${ind.key} ${ind.title} ${ind.explanation}`.toLowerCase();
      if (text.includes('sender') || text.includes('domain') || text.includes('mismatch')) {
        categories.header.push(ind);
      } else if (text.includes('url') || text.includes('link') || text.includes('tld')) {
        categories.url.push(ind);
      } else {
        categories.body.push(ind);
      }
    }
  });
  return categories;
}

/* ==========================================================================
   Main Application Component
   ========================================================================== */
function App() {
  const [emailText, setEmailText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [demoSamples, setDemoSamples] = useState([]);
  const [view, setView] = useState('analyse');
  const [ingestMode, setIngestMode] = useState('paste');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking');
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedSignals, setExpandedSignals] = useState({});
  const [signalFilter, setSignalFilter] = useState('all');
  const [inspectorTab, setInspectorTab] = useState('indicators');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [copiedIndicator, setCopiedIndicator] = useState(null);
  const [analystActionToast, setAnalystActionToast] = useState('');
  const [overriddenVerdict, setOverriddenVerdict] = useState(null);
  const [analystNote, setAnalystNote] = useState('');

  useEffect(() => {
    checkHealth();
    refreshHistory();
    fetchDemoSamples();
  }, []);

  async function checkHealth() {
    try {
      const response = await fetch(`${API}/api/health`);
      if (!response.ok) throw new Error('offline');
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
    }
  }

  async function refreshHistory() {
    try {
      const response = await fetch(`${API}/api/history`);
      if (!response.ok) throw new Error('History unavailable');
      const data = await response.json();
      setHistory(data.items || []);
    } catch {
      setHistory([]);
    }
  }

  async function fetchDemoSamples() {
    try {
      const response = await fetch(`${API}/api/demo-samples`);
      if (response.ok) {
        const data = await response.json();
        setDemoSamples(data.samples || []);
      }
    } catch {
      setDemoSamples([]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }

  function handleFileInput(e) {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  }

  function validateAndSetFile(selectedFile) {
    setError('');
    const validExtensions = ['.eml', '.txt', '.msg'];
    const hasValidExt = validExtensions.some((ext) => selectedFile.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && selectedFile.type !== 'message/rfc822' && selectedFile.type !== 'text/plain') {
      setError('Please select a valid RFC 822 email file (.eml, .txt, or .msg)');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    setFile(selectedFile);
    setEmailText('');
    setIngestMode('upload');
  }

  function loadSample(sampleText) {
    setFile(null);
    setEmailText(sampleText);
    setIngestMode('paste');
    setError('');
    setOverriddenVerdict(null);
    setAnalystNote('');
  }

  async function submitAnalysis(e) {
    if (e) e.preventDefault();
    setError('');
    setResult(null);
    setOverriddenVerdict(null);
    setAnalystActionToast('');
    setAnalystNote('');

    if (!file && !emailText.trim()) {
      setError('Provide an email payload: upload an .eml file or paste raw RFC 822 text.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (file) {
        const body = new FormData();
        body.append('file', file);
        response = await fetch(`${API}/api/analyse-file`, { method: 'POST', body });
      } else {
        response = await fetch(`${API}/api/analyse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_text: emailText }),
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Analysis error');

      setResult(data);
      setView('analyse');
      refreshHistory();

      const initialExpanded = {};
      if (data.indicators) {
        data.indicators.forEach((ind) => {
          if (ind.severity === 'high') initialExpanded[ind.key] = true;
        });
      }
      setExpandedSignals(initialExpanded);
    } catch (err) {
      setError(err.message || 'Unable to connect with triage backend.');
    } finally {
      setLoading(false);
    }
  }

  async function sendAnalystAction(actionType) {
    if (!result?.id) return;
    try {
      const res = await fetch(`${API}/api/analyses/${result.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          notes: analystNote || `Manual ${actionType} action logged by analyst.`,
          analyst_name: 'Srinivasa Moorty',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOverriddenVerdict(actionType);
        setAnalystActionToast(`AUDIT LOGGED: ${data.message} (${actionType})`);
        refreshHistory();
        setTimeout(() => setAnalystActionToast(''), 4500);
      }
    } catch {
      setAnalystActionToast('Failed to persist analyst action to database.');
    }
  }

  async function clearHistory() {
    if (!window.confirm('Clear all triage telemetry from database?')) return;
    try {
      await fetch(`${API}/api/history`, { method: 'DELETE' });
      setHistory([]);
    } catch {
      setError('Could not clear history.');
    }
  }

  function toggleSignal(key) {
    setExpandedSignals((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function copyEvidence(key, text) {
    navigator.clipboard.writeText(text);
    setCopiedIndicator(key);
    setTimeout(() => setCopiedIndicator(null), 2000);
  }

  const activeVerdict = overriddenVerdict || result?.recommended_action || 'REVIEW';
  const scoreClass =
    (result?.risk_score ?? 0) >= 60 ? 'score-high' : (result?.risk_score ?? 0) >= 25 ? 'score-medium' : 'score-low';

  const categorized = useMemo(() => {
    return result ? categorizeIndicators(result.indicators) : { header: [], url: [], body: [], reputation: [] };
  }, [result]);

  const filteredIndicators = useMemo(() => {
    if (!result?.indicators) return [];
    if (signalFilter === 'all') return result.indicators;
    return categorized[signalFilter] || [];
  }, [result, signalFilter, categorized]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        (item.sender || '').toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.subject || '').toLowerCase().includes(historySearch.toLowerCase());
      const matchFilter =
        historyFilter === 'all' ||
        (item.recommended_action || item.verdict || '').toLowerCase() === historyFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [history, historySearch, historyFilter]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result
    ? circumference - (Math.min(100, Math.max(0, result.risk_score)) / 100) * circumference
    : circumference;

  return (
    <div className="soc-shell">
      {/* Top Header */}
      <header className="soc-topbar">
        <div className="topbar-brand">
          <div className="brand-icon-wrapper">
            <ShieldIcon size={22} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              PHISHGUARD <span className="brand-tag">SOC WORKSTATION</span>
            </div>
            <div className="brand-subtitle">Explainable Phishing Triage Engine</div>
          </div>
        </div>

        <div className="topbar-telemetry">
          <div className="telemetry-item" title="Connection status">
            <span className={`status-beacon ${apiStatus === 'online' ? 'online' : 'offline'}`} />
            <span>API: {apiStatus === 'online' ? 'CONNECTED' : 'OFFLINE'}</span>
          </div>
          <div className="telemetry-item">
            <span className="status-beacon sync" />
            <span>HYBRID SIGNALS: ACTIVE (Rules + ML + Threat-Intel)</span>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="nav-pills">
            <button
              className={`nav-pill-btn ${view === 'analyse' ? 'active' : ''}`}
              onClick={() => setView('analyse')}
            >
              <ActivityIcon size={14} />
              <span>Triage Desk</span>
            </button>
            <button
              className={`nav-pill-btn ${view === 'history' ? 'active' : ''}`}
              onClick={() => {
                setView('history');
                refreshHistory();
              }}
            >
              <ClockIcon size={14} />
              <span>Audit Log</span>
              {history.length > 0 && <span className="badge-count">{history.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Demo Samples Bar */}
      {demoSamples.length > 0 && (
        <div className="scenario-bar">
          <div className="scenario-label">
            <ZapIcon size={13} />
            <span>1-CLICK DEMO VECTORS:</span>
          </div>
          <div className="scenario-chips">
            {demoSamples.map((sample) => (
              <button
                key={sample.id}
                className="scenario-chip"
                onClick={() => loadSample(sample.text)}
              >
                <span className={`scenario-dot ${sample.expected.toLowerCase()}`} />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="soc-workspace">
        {view === 'history' ? (
          /* Audit History View */
          <div className="history-view">
            <div className="history-header-row">
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>Audited Incident Telemetry</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                  Persistent SQLite audit records with human-in-the-loop analyst decisions.
                </p>
              </div>
              <div className="history-controls">
                <div className="search-input-wrapper">
                  <SearchIcon size={14} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search sender or subject..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
                <button
                  className="btn-secondary danger"
                  onClick={clearHistory}
                  disabled={!history.length}
                >
                  <TrashIcon size={14} />
                  <span>Clear Ledger</span>
                </button>
              </div>
            </div>

            <div className="history-table-container">
              {filteredHistory.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>SENDER</th>
                      <th>SUBJECT</th>
                      <th>RISK (RULES/ML/INTEL)</th>
                      <th>RECOMMENDED</th>
                      <th>ANALYST ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="history-time">{formatDate(item.created_at)}</td>
                        <td className="history-sender" title={item.sender}>{item.sender || 'Unknown'}</td>
                        <td className="history-subject" title={item.subject}>{item.subject || 'No Subject'}</td>
                        <td>
                          <strong>{item.risk_score}/100</strong>
                          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                            ({item.rule_score}/{item.ml_score}/{item.reputation_score})
                          </span>
                        </td>
                        <td>
                          <span className={`severity-pill ${item.recommended_action === 'QUARANTINE' ? 'severity-high' : item.recommended_action === 'REVIEW' ? 'severity-medium' : 'severity-low'}`}>
                            {item.recommended_action || item.verdict}
                          </span>
                        </td>
                        <td>
                          {item.analyst_action ? (
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                              {item.analyst_action} {item.analyst_action !== item.recommended_action && ' (OVERRIDE)'}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b' }}>Pending Review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="history-empty-state">
                  <DatabaseIcon size={36} className="standby-icon" />
                  <h3>No Recorded Incident Telemetry</h3>
                  <button className="btn-secondary" onClick={() => setView('analyse')}>
                    Return to Triage Desk
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Triage Workstation Grid */
          <div className="soc-grid">
            {/* Left Column: Ingest */}
            <div className="soc-card ingest-panel">
              <div className="card-header">
                <div className="card-header-title">
                  <MailIcon size={16} className="card-header-icon" />
                  <h2>EMAIL INGEST</h2>
                </div>
                <span className="card-badge">INPUT</span>
              </div>

              <div className="ingest-tabs">
                <button
                  className={`ingest-tab-btn ${ingestMode === 'paste' ? 'active' : ''}`}
                  onClick={() => setIngestMode('paste')}
                >
                  <FileTextIcon size={15} />
                  <span>Raw Text / RFC 822</span>
                </button>
                <button
                  className={`ingest-tab-btn ${ingestMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setIngestMode('upload')}
                >
                  <UploadIcon size={15} />
                  <span>Upload .eml File</span>
                </button>
              </div>

              <div className="ingest-body">
                {ingestMode === 'upload' ? (
                  <>
                    <div
                      className={`dropzone-container ${isDragOver ? 'drag-over' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".eml,.txt,.msg,message/rfc822"
                        onChange={handleFileInput}
                      />
                      <div className="dropzone-content">
                        <UploadIcon size={24} />
                        <h3>Drop .eml payload here</h3>
                        <p>Standard RFC 822 emails supported</p>
                      </div>
                    </div>
                    {file && (
                      <div className="selected-file-card">
                        <FileTextIcon size={20} />
                        <div className="file-details">
                          <div className="file-name">{file.name}</div>
                          <div className="file-meta">{formatBytes(file.size)}</div>
                        </div>
                        <button className="file-remove-btn" onClick={() => setFile(null)}>
                          <XCircleIcon size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="textarea-wrapper">
                    <textarea
                      id="raw-email-input"
                      className="raw-textarea"
                      value={emailText}
                      onChange={(e) => {
                        setEmailText(e.target.value);
                        setFile(null);
                      }}
                      placeholder="Paste RFC 822 headers and body text here..."
                    />
                  </div>
                )}

                {error && (
                  <div className="error-banner">
                    <AlertTriangleIcon size={18} />
                    <div>{error}</div>
                  </div>
                )}

                <div className="ingest-footer">
                  <button
                    className="btn-cyber-primary"
                    onClick={submitAnalysis}
                    disabled={loading || apiStatus === 'offline' || (!file && !emailText.trim())}
                  >
                    {loading ? (
                      <span>RUNNING HYBRID TRIAGE...</span>
                    ) : (
                      <>
                        <ZapIcon size={16} />
                        <span>RUN EXPLAINABLE TRIAGE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Triage Results */}
            <div className="triage-panel">
              {!result ? (
                <div className="soc-card standby-card">
                  <ShieldIcon size={38} className="standby-icon" />
                  <h3>SOC Sensor Ready For Ingest</h3>
                  <p>Load a 1-click vector above or paste an email to inspect threats.</p>
                </div>
              ) : (
                <>
                  {/* Verdict Banner with One-Click Override */}
                  <div
                    className={`verdict-banner ${
                      activeVerdict === 'QUARANTINE'
                        ? 'verdict-quarantine'
                        : activeVerdict === 'REVIEW'
                        ? 'verdict-review'
                        : 'verdict-allow'
                    }`}
                  >
                    <div className="verdict-primary">
                      <div className="verdict-icon-box">
                        {activeVerdict === 'QUARANTINE' ? (
                          <ShieldAlertIcon size={32} />
                        ) : activeVerdict === 'REVIEW' ? (
                          <AlertTriangleIcon size={32} />
                        ) : (
                          <ShieldCheckIcon size={32} />
                        )}
                      </div>
                      <div className="verdict-titles">
                        <div className="verdict-kicker">
                          VERDICT: {result.recommended_action} {overriddenVerdict && `• OVERRIDDEN TO ${overriddenVerdict}`}
                        </div>
                        <div className="verdict-main-text">
                          {activeVerdict === 'QUARANTINE'
                            ? 'QUARANTINE // HIGH RISK'
                            : activeVerdict === 'REVIEW'
                            ? 'REVIEW // SUSPICIOUS'
                            : 'ALLOW // BENIGN'}
                        </div>
                        <div className="verdict-desc">{result.summary}</div>
                      </div>
                    </div>

                    {/* Analyst Decision Actions */}
                    <div className="verdict-actions">
                      <button className="action-btn action-btn-confirm" onClick={() => sendAnalystAction('ALLOW')}>
                        ALLOW
                      </button>
                      <button className="action-btn action-btn-override" onClick={() => sendAnalystAction('REVIEW')}>
                        REVIEW
                      </button>
                      <button className="action-btn action-btn-override" style={{ background: '#dc2626' }} onClick={() => sendAnalystAction('QUARANTINE')}>
                        QUARANTINE
                      </button>
                    </div>
                  </div>

                  {analystActionToast && (
                    <div className="action-toast">
                      <CheckCircleIcon size={16} />
                      <span>{analystActionToast}</span>
                    </div>
                  )}

                  {/* 3-Pillar Hybrid Telemetry */}
                  <div className="score-telemetry-grid">
                    <div className="soc-card confidence-gauge-card">
                      <div className="field-label">OVERALL HYBRID RISK</div>
                      <div className="gauge-svg-container">
                        <svg className="gauge-svg" viewBox="0 0 140 140">
                          <circle className="gauge-bg-ring" cx="70" cy="70" r={radius} />
                          <circle
                            className={`gauge-progress-ring ${scoreClass}`}
                            cx="70"
                            cy="70"
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                          />
                        </svg>
                        <div className="gauge-center-text">
                          <span className="gauge-score-value">{result.risk_score}</span>
                          <span className="gauge-score-label">/ 100</span>
                        </div>
                      </div>
                      <div className={`gauge-caption ${scoreClass}`}>{result.verdict}</div>
                    </div>

                    {/* 3 Pillars Breakdown */}
                    <div className="soc-card intel-card">
                      <div className="field-label" style={{ marginBottom: '12px' }}>
                        HYBRID SIGNAL BREAKDOWN
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Rules Engine (35% Weight)</span>
                            <strong>{result.score_breakdown?.rules ?? 0}/100</strong>
                          </div>
                          <div className="mini-score-bar">
                            <div className="mini-score-fill" style={{ width: `${result.score_breakdown?.rules ?? 0}%`, background: '#38bdf8' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>ML Text Classifier (35% Weight)</span>
                            <strong>{result.score_breakdown?.ml ?? 0}/100</strong>
                          </div>
                          <div className="mini-score-bar">
                            <div className="mini-score-fill" style={{ width: `${result.score_breakdown?.ml ?? 0}%`, background: '#a855f7' }} />
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Threat-Intel &amp; Reputation (30% Weight)</span>
                            <strong>{result.score_breakdown?.reputation ?? 0}/100</strong>
                          </div>
                          <div className="mini-score-bar">
                            <div className="mini-score-fill" style={{ width: `${result.score_breakdown?.reputation ?? 0}%`, background: '#f59e0b' }} />
                          </div>
                        </div>
                      </div>

                      {/* Explainable ML Keywords Badges */}
                      {result.ml_explainability?.top_features?.length > 0 && (
                        <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                          <span className="meta-key" style={{ display: 'block', marginBottom: '6px' }}>
                            EXPLAINABLE ML CUES (HIGHEST RISK TERMS)
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {result.ml_explainability.top_features.map((feat, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontFamily: 'var(--font-mono)',
                                }}
                              >
                                {feat.term} (+{feat.impact_score})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidence Tree Section */}
                  <div className="evidence-tree-section">
                    <div className="section-title-row">
                      <div className="section-title">
                        <ActivityIcon size={16} />
                        <span>EVIDENCE TREE ({result.indicators?.length || 0} SIGNALS)</span>
                      </div>
                      <div className="evidence-filters">
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('all')}
                        >
                          All ({result.indicators?.length || 0})
                        </button>
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'reputation' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('reputation')}
                        >
                          Threat-Intel ({categorized.reputation.length})
                        </button>
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'header' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('header')}
                        >
                          Headers &amp; Domains ({categorized.header.length})
                        </button>
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'body' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('body')}
                        >
                          Body Heuristics ({categorized.body.length})
                        </button>
                      </div>
                    </div>

                    <div className="signals-list">
                      {filteredIndicators.map((ind, idx) => {
                        const key = ind.key || idx;
                        const isExpanded = !!expandedSignals[key];
                        return (
                          <div key={key} className={`signal-card ${isExpanded ? 'expanded' : ''}`}>
                            <div className="signal-summary-bar" onClick={() => toggleSignal(key)}>
                              <div className="signal-left">
                                <span className={`severity-pill severity-${ind.severity}`}>
                                  {ind.severity}
                                </span>
                                <span className="signal-title">{ind.title}</span>
                              </div>
                              <div className="signal-right">
                                <span className="points-pill">+{ind.points} PTS</span>
                                <ChevronDownIcon size={16} className="chevron-icon" />
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="signal-content">
                                <p className="signal-explanation">{ind.explanation}</p>
                                {ind.evidence && (
                                  <div style={{ position: 'relative' }}>
                                    <div className="signal-evidence-quote">{ind.evidence}</div>
                                    <button
                                      style={{ position: 'absolute', top: '8px', right: '8px' }}
                                      onClick={() => copyEvidence(key, ind.evidence)}
                                    >
                                      <CopyIcon size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="soc-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-team-title">TEAM CODE BLOODED • PHISHGUARD</div>
            <div className="footer-members">Devansh Chauhan • Rishant Chauhan • Srinivasa Moorty</div>
          </div>
          <div className="footer-right">
            <span>FastAPI + scikit-learn + React (Vite)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
