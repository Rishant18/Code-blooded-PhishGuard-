import React, { useEffect, useState, useMemo } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/* ==========================================================================
   Inline SVG Icons (Lucide-inspired)
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
   Demo Test Scenarios
   ========================================================================== */
const DEMO_SCENARIOS = {
  legit: {
    label: 'Legit Newsletter',
    verdictType: 'allow',
    description: 'Clean developer digest with valid DKIM/SPF headers and safe links',
    content: `From: newsletters@techweekly.dev
To: analyst@enterprise-sec.org
Subject: TechWeekly Issue #142: Breakthroughs in Post-Quantum Cryptography & Zero Trust
Date: Mon, 27 Oct 2026 09:15:00 +0000
Message-ID: <tw-issue-142-2026@techweekly.dev>
Authentication-Results: spf=pass smtp.mailfrom=techweekly.dev; dkim=pass header.d=techweekly.dev; dmarc=pass

Hi Developer,

Here is your weekly engineering digest:
1. NIST finalizes post-quantum encryption standards for enterprise networks.
2. AI-driven triage pipelines reduce SOC mean-time-to-detect by 64%.
3. Best practices for hardening Kubernetes API gateways.

Read the complete briefing online: https://techweekly.dev/briefings/142
To update your preferences or unsubscribe: https://techweekly.dev/manage-subscription?id=soc-9921

TechWeekly Media Group, 450 Cyber Way, Suite 800.
`,
  },
  ceo: {
    label: 'CEO Impersonation',
    verdictType: 'review',
    description: 'Executive spearphishing with display name spoofing & urgency markers',
    content: `From: "David Henderson (CEO)" <ceo-direct-office@mail-exec-portal.net>
Reply-To: executive.direct01@gmail.com
To: finance-ops@enterprise-sec.org
Subject: URGENT & CONFIDENTIAL: Wire Transfer Clearance for Project Falcon Acquisition
Date: Mon, 27 Oct 2026 08:30:12 +0000
X-Priority: 1 (Highest)
Importance: High

Good morning,

I am currently in an unscheduled confidential executive session with our M&A legal advisors regarding the Project Falcon acquisition target.

We require an immediate wire release of $48,500 processed before 11:30 AM EST to satisfy the escrow retention milestone. Please reply immediately to this email thread so I can provide the beneficiary account coordinates.

Do not attempt to call my mobile line as all devices are restricted in the boardroom. Treat this instruction with utmost confidentiality.

Regards,
David Henderson
Chief Executive Officer
Enterprise Global Holdings
`,
  },
  harvest: {
    label: 'Credential Harvest',
    verdictType: 'quarantine',
    description: 'High-risk account suspension lure with raw IP destination link',
    content: `From: "Microsoft 365 Defender Alert" <no-reply@sec-m365-account-recovery-portal.com>
To: target-user@enterprise-sec.org
Subject: CRITICAL: Your Microsoft 365 Session Has Expired - Immediate Verification Required
Date: Mon, 27 Oct 2026 10:04:22 +0000
Priority: Urgent

MICROSOFT 365 SECURITY NOTIFICATION

An unauthorized authentication attempt was intercepted for your organization mailbox from IP address 185.220.101.5 (Kyiv, Ukraine).

Your security profile has been temporarily restricted. To prevent permanent mailbox lockout and account suspension within the next 60 minutes, confirm your identity immediately via our secure gateway:

http://192.168.1.105/auth/microsoft-login-verify/reset.php?token=sec93821038472

Warning: Failure to verify identity will result in active token revocation and immediate administrative escalation.

Microsoft Defender for Office 365
Security Operations Center
`,
  },
};

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

/* Categorize indicators for the Evidence Tree */
function categorizeIndicators(indicators = []) {
  const categories = {
    header: [],
    url: [],
    body: [],
    ml: [],
  };

  indicators.forEach((ind) => {
    const text = `${ind.key} ${ind.title} ${ind.explanation}`.toLowerCase();
    if (text.includes('header') || text.includes('sender') || text.includes('spoof') || text.includes('from') || text.includes('reply-to') || text.includes('dkim') || text.includes('spf') || text.includes('domain')) {
      categories.header.push(ind);
    } else if (text.includes('url') || text.includes('link') || text.includes('ip') || text.includes('tld') || text.includes('anchor') || text.includes('harvest') || text.includes('http')) {
      categories.url.push(ind);
    } else if (text.includes('ml') || text.includes('model') || text.includes('probability')) {
      categories.ml.push(ind);
    } else {
      categories.body.push(ind);
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
  const [view, setView] = useState('analyse'); // 'analyse' | 'history'
  const [ingestMode, setIngestMode] = useState('upload'); // 'upload' | 'paste'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedSignals, setExpandedSignals] = useState({});
  const [signalFilter, setSignalFilter] = useState('all'); // 'all' | 'header' | 'url' | 'body'
  const [inspectorTab, setInspectorTab] = useState('indicators'); // 'indicators' | 'source' | 'method'
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'allow' | 'review' | 'quarantine'
  const [copiedIndicator, setCopiedIndicator] = useState(null);
  const [analystActionToast, setAnalystActionToast] = useState('');
  const [overriddenVerdict, setOverriddenVerdict] = useState(null);

  // Fetch API health and history on mount
  useEffect(() => {
    checkHealth();
    refreshHistory();
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

  // Handle Drag & Drop
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
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }

  function handleFileInput(e) {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
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
      setError('File size exceeds the 5MB security threshold');
      return;
    }
    setFile(selectedFile);
    setEmailText('');
    setIngestMode('upload');
  }

  function removeSelectedFile(e) {
    e?.stopPropagation();
    setFile(null);
  }

  // Quick-load demo test scenario
  function loadDemoScenario(scenarioKey) {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (!scenario) return;
    setFile(null);
    setEmailText(scenario.content);
    setIngestMode('paste');
    setError('');
    setOverriddenVerdict(null);
  }

  // Submit analysis
  async function submitAnalysis(e) {
    if (e) e.preventDefault();
    setError('');
    setResult(null);
    setOverriddenVerdict(null);
    setAnalystActionToast('');

    if (!file && !emailText.trim()) {
      setError('Please provide an email payload: upload an .eml file or paste raw RFC 822 text.');
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
      if (!response.ok) {
        throw new Error(data.detail || 'Analysis pipeline returned an error. Verify that the backend is running.');
      }

      setResult(data);
      setView('analyse');
      refreshHistory();

      // Expand all high severity signals by default
      const initialExpanded = {};
      if (data.indicators) {
        data.indicators.forEach((ind) => {
          if (ind.severity === 'high') {
            initialExpanded[ind.key] = true;
          }
        });
      }
      setExpandedSignals(initialExpanded);
    } catch (err) {
      setError(err.message || 'Unable to establish socket connection with triage engine.');
    } finally {
      setLoading(false);
    }
  }

  // Clear history
  async function clearHistory() {
    if (!window.confirm('Clear all locally stored analysis telemetry from the SQLite database?')) return;
    try {
      const response = await fetch(`${API}/api/history`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setHistory([]);
    } catch {
      setError('Could not clear history. Verify API connectivity.');
    }
  }

  // Toggle signal accordion
  function toggleSignal(key) {
    setExpandedSignals((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  // Copy evidence text
  function copyEvidence(key, text) {
    navigator.clipboard.writeText(text);
    setCopiedIndicator(key);
    setTimeout(() => setCopiedIndicator(null), 2000);
  }

  // Analyst Action Handlers
  function handleConfirmVerdict() {
    const verdict = activeVerdict;
    setAnalystActionToast(`VERDICT CONFIRMED: ${verdict} policy enforced. Event logged to SIEM audit log.`);
    setTimeout(() => setAnalystActionToast(''), 5000);
  }

  function handleManualOverride() {
    const verdicts = ['ALLOW', 'REVIEW', 'QUARANTINE'];
    const current = activeVerdict;
    const currentIndex = verdicts.indexOf(current);
    const nextVerdict = verdicts[(currentIndex + 1) % verdicts.length];
    setOverriddenVerdict(nextVerdict);
    setAnalystActionToast(`ANALYST OVERRIDE APPLIED: Verdict altered from ${current} to ${nextVerdict}.`);
    setTimeout(() => setAnalystActionToast(''), 5000);
  }

  function handleExportReport() {
    if (!result) return;
    const reportData = {
      phishguard_version: '2.4.1',
      report_generated_at: new Date().toISOString(),
      active_verdict: activeVerdict,
      original_verdict: result.verdict,
      risk_score: result.risk_score,
      sender: result.sender,
      subject: result.subject,
      recommended_action: result.recommended_action,
      summary: result.summary,
      ml_telemetry: result.ml,
      indicators: result.indicators,
      method: result.method,
      limitations: result.limitations,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phishguard-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Computed values
  const activeVerdict = overriddenVerdict || result?.verdict || 'REVIEW';
  const scoreClass =
    (result?.risk_score ?? 0) >= 60 ? 'score-high' : (result?.risk_score ?? 0) >= 25 ? 'score-medium' : 'score-low';

  const categorized = useMemo(() => {
    return result ? categorizeIndicators(result.indicators) : { header: [], url: [], body: [], ml: [] };
  }, [result]);

  const filteredIndicators = useMemo(() => {
    if (!result || !result.indicators) return [];
    if (signalFilter === 'all') return result.indicators;
    return categorized[signalFilter] || [];
  }, [result, signalFilter, categorized]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        (item.sender || '').toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.subject || '').toLowerCase().includes(historySearch.toLowerCase());
      const matchFilter =
        historyFilter === 'all' || (item.verdict || '').toLowerCase() === historyFilter.toLowerCase();
      return matchSearch && matchFilter;
    });
  }, [history, historySearch, historyFilter]);

  // SVG Radial Gauge Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = result
    ? circumference - (Math.min(100, Math.max(0, result.risk_score)) / 100) * circumference
    : circumference;

  return (
    <div className="soc-shell">
      {/* ====================================================================
          Top Bar: Cyber Defense Header
          ==================================================================== */}
      <header className="soc-topbar">
        {/* Left: Branding */}
        <div className="topbar-brand">
          <div className="brand-icon-wrapper">
            <ShieldIcon size={22} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              PHISHGUARD <span className="brand-tag">SOC WORKSTATION</span>
            </div>
            <div className="brand-subtitle">Automated Email Triage &amp; Threat Forensics</div>
          </div>
        </div>

        {/* Center: System Telemetry Indicators */}
        <div className="topbar-telemetry">
          <div className="telemetry-item" title="Connection status to FastAPI threat engine">
            <span className={`status-beacon ${apiStatus === 'online' ? 'online' : 'offline'}`} />
            <span>API: {apiStatus === 'online' ? 'CONNECTED' : apiStatus === 'offline' ? 'OFFLINE' : 'CHECKING...'}</span>
          </div>
          <div className="telemetry-item" title="Threat Signature Database Sync Status">
            <span className="status-beacon sync" />
            <span>THREAT INTEL: SYNCHRONIZED [v2.4.1]</span>
          </div>
        </div>

        {/* Right: Workspace Navigation */}
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

      {/* Quick-Load Demo Scenarios Bar */}
      <div className="scenario-bar">
        <div className="scenario-label">
          <ZapIcon size={13} />
          <span>QUICK-LOAD VECTORS:</span>
        </div>
        <div className="scenario-chips">
          {Object.entries(DEMO_SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              className="scenario-chip"
              onClick={() => loadDemoScenario(key)}
              title={scenario.description}
            >
              <span className={`scenario-dot ${scenario.verdictType}`} />
              <span>{scenario.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================================
          Main Workspace
          ==================================================================== */}
      <main className="soc-workspace">
        {view === 'history' ? (
          /* ================================================================
             History View / Audit Log Table
             ================================================================ */
          <div className="history-view">
            <div className="history-header-row">
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>Incident Telemetry Archive</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                  Audited email triage records persisted in the local SQLite threat ledger.
                </p>
              </div>
              <div className="history-controls">
                <div className="search-input-wrapper">
                  <SearchIcon size={14} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Filter by sender or subject..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
                <button
                  className="btn-secondary danger"
                  onClick={clearHistory}
                  disabled={!history.length}
                  title="Purge all logged triage runs"
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
                      <th>SENDER ENTITY</th>
                      <th>SUBJECT LINE</th>
                      <th>RISK INDEX</th>
                      <th>FINAL VERDICT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => {
                      const itemScoreClass =
                        item.risk_score >= 60 ? 'score-high' : item.risk_score >= 25 ? 'score-medium' : 'score-low';
                      return (
                        <tr key={item.id}>
                          <td className="history-time">{formatDate(item.created_at)}</td>
                          <td className="history-sender" title={item.sender}>
                            {item.sender || '<Empty Header>'}
                          </td>
                          <td className="history-subject" title={item.subject}>
                            {item.subject || '<No Subject>'}
                          </td>
                          <td>
                            <div className="history-score-cell">
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                {item.risk_score}/100
                              </span>
                              <div className="mini-score-bar">
                                <div
                                  className={`mini-score-fill ${
                                    item.risk_score >= 60
                                      ? 'bg-rose'
                                      : item.risk_score >= 25
                                      ? 'bg-amber'
                                      : 'bg-emerald'
                                  }`}
                                  style={{
                                    width: `${item.risk_score}%`,
                                    backgroundColor:
                                      item.risk_score >= 60 ? '#ef4444' : item.risk_score >= 25 ? '#f59e0b' : '#10b981',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`severity-pill ${
                                item.verdict === 'QUARANTINE'
                                  ? 'severity-high'
                                  : item.verdict === 'REVIEW'
                                  ? 'severity-medium'
                                  : 'severity-low'
                              }`}
                            >
                              {item.verdict}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="history-empty-state">
                  <DatabaseIcon size={36} className="standby-icon" />
                  <h3>No Recorded Incident Telemetry</h3>
                  <p>Analyzed messages will appear in this forensic ledger once submitted through the triage desk.</p>
                  <button className="btn-secondary" onClick={() => setView('analyse')}>
                    Return to Ingest Panel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================================================================
             Triage Workstation: Ingest & Triage Grid
             ================================================================ */
          <div className="soc-grid">
            {/* --------------------------------------------------------------
                Left Column: Ingest Stream
                -------------------------------------------------------------- */}
            <div className="soc-card ingest-panel">
              <div className="card-header">
                <div className="card-header-title">
                  <MailIcon size={16} className="card-header-icon" />
                  <h2>INGEST STREAM</h2>
                </div>
                <span className="card-badge">INPUT CHANNEL</span>
              </div>

              {/* Mode Switching Tabs */}
              <div className="ingest-tabs">
                <button
                  className={`ingest-tab-btn ${ingestMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setIngestMode('upload')}
                >
                  <UploadIcon size={15} />
                  <span>Upload .eml Payload</span>
                </button>
                <button
                  className={`ingest-tab-btn ${ingestMode === 'paste' ? 'active' : ''}`}
                  onClick={() => setIngestMode('paste')}
                >
                  <FileTextIcon size={15} />
                  <span>Raw RFC 822 Source</span>
                </button>
              </div>

              <div className="ingest-body">
                {ingestMode === 'upload' ? (
                  /* File Upload Drop Zone */
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
                        title="Upload RFC 822 Email File"
                      />
                      <div className="dropzone-content">
                        <div className="dropzone-icon">
                          <UploadIcon size={24} />
                        </div>
                        <div className="dropzone-text">
                          <h3>Drop raw .eml file here</h3>
                          <p>Drag and drop or browse local filesystem</p>
                        </div>
                        <div className="dropzone-specs">
                          <span>RFC 822 COMPLIANT</span>
                          <span>•</span>
                          <span>MAX 5 MB</span>
                        </div>
                      </div>
                    </div>

                    {file && (
                      <div className="selected-file-card">
                        <div className="file-info">
                          <FileTextIcon size={20} className="file-info-icon" />
                          <div className="file-details">
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                              {formatBytes(file.size)} • READY FOR DEEP INSPECTION
                            </div>
                          </div>
                        </div>
                        <button
                          className="file-remove-btn"
                          onClick={removeSelectedFile}
                          title="Remove file"
                        >
                          <XCircleIcon size={16} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Raw RFC 822 Textarea */
                  <div className="textarea-wrapper">
                    <div className="textarea-header">
                      <label htmlFor="raw-email-input" className="field-label">
                        RFC 822 SOURCE STREAM
                      </label>
                      <span className="char-counter">
                        {emailText.length} chars • {emailText.split('\n').length} lines
                      </span>
                    </div>
                    <textarea
                      id="raw-email-input"
                      className="raw-textarea"
                      value={emailText}
                      onChange={(e) => {
                        setEmailText(e.target.value);
                        setFile(null);
                      }}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          submitAnalysis(e);
                        }
                      }}
                      placeholder={`From: sender@domain.com\nTo: recipient@company.com\nSubject: Invoice #82910\nDate: Mon, 27 Oct 2026 10:00:00 +0000\nAuthentication-Results: spf=pass...\n\nPaste RFC 822 headers and body text here...`}
                    />
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="error-banner" role="alert">
                    <AlertTriangleIcon size={18} />
                    <div>{error}</div>
                  </div>
                )}

                {/* Action CTA */}
                <div className="ingest-footer">
                  <button
                    className="btn-cyber-primary"
                    onClick={submitAnalysis}
                    disabled={loading || apiStatus === 'offline' || (!file && !emailText.trim())}
                  >
                    {loading ? (
                      <>
                        <div className="status-beacon sync" />
                        <span>RUNNING TRIAGE PIPELINE...</span>
                      </>
                    ) : (
                      <>
                        <ZapIcon size={16} />
                        <span>INSPECT THREAT VECTOR</span>
                      </>
                    )}
                  </button>
                  <div className="ingest-note">
                    <ShieldCheckIcon size={13} />
                    <span>Payloads evaluated in isolated memory sandbox. Zero link resolution.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------
                Right/Center Column: Triage Summary & Forensics
                -------------------------------------------------------------- */}
            <div className="triage-panel">
              {loading ? (
                /* Scanning Animation State */
                <div className="soc-card scanning-card">
                  <div className="scanner-ring" />
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                      EXECUTING MULTI-STAGE TRIAGE
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                      Dissecting headers, scoring linguistic entropy, and calculating heuristic weights...
                    </p>
                  </div>
                  <div className="scanner-steps">
                    <div className="scanner-step-item">
                      <span>1. RFC 822 Header Parsing</span>
                      <span style={{ color: 'var(--emerald-400)' }}>DONE</span>
                    </div>
                    <div className="scanner-step-item">
                      <span>2. DKIM / SPF Sender Authentication</span>
                      <span style={{ color: 'var(--cyan-400)' }}>ANALYZING</span>
                    </div>
                    <div className="scanner-step-item">
                      <span>3. URL &amp; Domain Heuristics</span>
                      <span style={{ color: 'var(--text-muted)' }}>PENDING</span>
                    </div>
                    <div className="scanner-step-item">
                      <span>4. ML Classifier Vector Synthesis</span>
                      <span style={{ color: 'var(--text-muted)' }}>PENDING</span>
                    </div>
                  </div>
                </div>
              ) : !result ? (
                /* Standby / Initial State */
                <div className="soc-card standby-card">
                  <div className="radar-target">
                    <ShieldIcon size={38} className="standby-icon" />
                  </div>
                  <div className="standby-text">
                    <h3>SOC Sensor Ready For Ingest</h3>
                    <p>
                      Ingest an email payload via the left-hand panel or select a quick-load demo vector from the top bar to initialize real-time security forensics.
                    </p>
                  </div>
                  <div className="standby-features">
                    <div className="feature-pill">
                      <ZapIcon size={13} />
                      <span>Heuristic Rule Engine</span>
                    </div>
                    <div className="feature-pill">
                      <ActivityIcon size={13} />
                      <span>ML Probability Ensemble</span>
                    </div>
                    <div className="feature-pill">
                      <ShieldCheckIcon size={13} />
                      <span>Spoofing &amp; BEC Detection</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Forensic Result */
                <>
                  {/* 1. Verdict Banner */}
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
                          OFFICIAL TRIAGE VERDICT {overriddenVerdict && '• [MANUAL OVERRIDE]'}
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

                    {/* One-Click Action Buttons */}
                    <div className="verdict-actions">
                      <button className="action-btn action-btn-confirm" onClick={handleConfirmVerdict}>
                        <CheckCircleIcon size={14} />
                        <span>Confirm {activeVerdict}</span>
                      </button>
                      <button className="action-btn action-btn-override" onClick={handleManualOverride}>
                        <ActivityIcon size={14} />
                        <span>Cycle Override</span>
                      </button>
                      <button className="action-btn action-btn-override" onClick={handleExportReport}>
                        <DownloadIcon size={14} />
                        <span>Export Forensic JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Confirmation Toast if clicked */}
                  {analystActionToast && (
                    <div className="action-toast">
                      <CheckCircleIcon size={16} />
                      <span>{analystActionToast}</span>
                    </div>
                  )}

                  {/* 2. Confidence Gauge & Metadata */}
                  <div className="score-telemetry-grid">
                    {/* Radial Confidence Gauge */}
                    <div className="soc-card confidence-gauge-card">
                      <div className="field-label" style={{ marginBottom: '12px' }}>
                        CALIBRATED RISK GAUGE
                      </div>
                      <div className="gauge-svg-container">
                        <svg className="gauge-svg" viewBox="0 0 140 140">
                          <circle
                            className="gauge-bg-ring"
                            cx="70"
                            cy="70"
                            r={radius}
                          />
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
                      <div className={`gauge-caption ${scoreClass}`}>
                        {result.risk_score >= 60
                          ? 'HIGH RISK LEVEL'
                          : result.risk_score >= 25
                          ? 'ELEVATED SUSPICION'
                          : 'BENIGN RISK PROFILE'}
                      </div>
                    </div>

                    {/* Metadata & Recommended Action Card */}
                    <div className="soc-card intel-card">
                      <div className="meta-grid">
                        <div className="meta-field">
                          <span className="meta-key">SENDER IDENTITY</span>
                          <span className="meta-val" title={result.sender}>
                            {result.sender || '<None Extracted>'}
                          </span>
                        </div>
                        <div className="meta-field">
                          <span className="meta-key">SUBJECT HEADER</span>
                          <span className="meta-val" title={result.subject}>
                            {result.subject || '<No Subject>'}
                          </span>
                        </div>
                        <div className="meta-field">
                          <span className="meta-key">CLASSIFICATION PIPELINE</span>
                          <span className="meta-val">{result.method || 'Heuristic Rules + ML'}</span>
                        </div>
                        <div className="meta-field">
                          <span className="meta-key">SIGNALS TRIGGERED</span>
                          <span className="meta-val">
                            {result.indicators ? result.indicators.length : 0} Anomaly Vector(s)
                          </span>
                        </div>
                      </div>

                      <div className="recommendation-box">
                        <div className="recommendation-header">
                          <ShieldAlertIcon size={14} />
                          <span>RECOMMENDED RESPONSE ACTION</span>
                        </div>
                        <div className="recommendation-title">{result.recommended_action}</div>
                        <div className="recommendation-body">{result.summary}</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Machine Learning Estimate Card (if provided by API) */}
                  {result.ml && (
                    <div className="ml-telemetry-card">
                      <div className="ml-header">
                        <div className="ml-header-title">
                          <ZapIcon size={14} />
                          <span>ML CLASSIFIER INFERENCE</span>
                        </div>
                        <span className="ml-prediction-badge">
                          PREDICTION: {result.ml.prediction?.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-stats-row">
                        <div className="ml-progress-track">
                          <div
                            className="ml-progress-fill"
                            style={{
                              width: `${result.ml.phishing_probability}%`,
                              backgroundColor:
                                result.ml.phishing_probability >= 60
                                  ? '#ef4444'
                                  : result.ml.phishing_probability >= 35
                                  ? '#f59e0b'
                                  : '#10b981',
                            }}
                          />
                        </div>
                        <div className="ml-prob-val">{result.ml.phishing_probability}% Probability</div>
                      </div>
                      <div className="ml-meta-sub">
                        <span>
                          {result.ml.model_name} • {result.ml.training_examples} baseline training instances
                        </span>
                        <span>{result.ml.model_note}</span>
                      </div>
                    </div>
                  )}

                  {/* 4. Evidence Tree: Expandable Signal Cards */}
                  <div className="evidence-tree-section">
                    <div className="section-title-row">
                      <div className="section-title">
                        <ActivityIcon size={16} />
                        <span>EVIDENCE TREE &amp; SIGNAL TELEMETRY</span>
                      </div>
                      <div className="evidence-filters">
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('all')}
                        >
                          All ({result.indicators?.length || 0})
                        </button>
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'header' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('header')}
                        >
                          Headers ({categorized.header.length})
                        </button>
                        <button
                          className={`evidence-filter-btn ${signalFilter === 'url' ? 'active' : ''}`}
                          onClick={() => setSignalFilter('url')}
                        >
                          URLs ({categorized.url.length})
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
                      {filteredIndicators.length > 0 ? (
                        filteredIndicators.map((ind) => {
                          const isExpanded = !!expandedSignals[ind.key];
                          return (
                            <div
                              key={ind.key}
                              className={`signal-card ${isExpanded ? 'expanded' : ''}`}
                            >
                              <div
                                className="signal-summary-bar"
                                onClick={() => toggleSignal(ind.key)}
                              >
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
                                        style={{
                                          position: 'absolute',
                                          top: '8px',
                                          right: '8px',
                                          color: copiedIndicator === ind.key ? '#34d399' : '#94a3b8',
                                          padding: '4px',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyEvidence(ind.key, ind.evidence);
                                        }}
                                        title="Copy evidence extract"
                                      >
                                        <CopyIcon size={14} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="no-findings-box">
                          No anomalous triggers detected in this category. All evaluated heuristics satisfied security baselines.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. Raw Inspector Panel */}
                  <div className="soc-card inspector-section">
                    <div className="inspector-tabs">
                      <button
                        className={`inspector-tab-btn ${inspectorTab === 'indicators' ? 'active' : ''}`}
                        onClick={() => setInspectorTab('indicators')}
                      >
                        Extracted Indicators Matrix
                      </button>
                      <button
                        className={`inspector-tab-btn ${inspectorTab === 'source' ? 'active' : ''}`}
                        onClick={() => setInspectorTab('source')}
                      >
                        Raw RFC 822 Payload
                      </button>
                      <button
                        className={`inspector-tab-btn ${inspectorTab === 'method' ? 'active' : ''}`}
                        onClick={() => setInspectorTab('method')}
                      >
                        Model Limitations &amp; Disclaimers
                      </button>
                    </div>

                    <div className="inspector-body">
                      {inspectorTab === 'indicators' && (
                        <div style={{ overflowX: 'auto' }}>
                          <table className="history-table" style={{ background: 'transparent' }}>
                            <thead>
                              <tr>
                                <th>INDICATOR KEY</th>
                                <th>SEVERITY</th>
                                <th>SCORE WEIGHT</th>
                                <th>EXPLANATION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.indicators?.map((item) => (
                                <tr key={item.key}>
                                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>
                                    {item.key}
                                  </td>
                                  <td>
                                    <span className={`severity-pill severity-${item.severity}`}>
                                      {item.severity}
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                    +{item.points} pts
                                  </td>
                                  <td>{item.explanation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {inspectorTab === 'source' && (
                        <div className="code-block">
                          {file
                            ? `[Binary / Multipart payload loaded from file: ${file.name} (${formatBytes(file.size)})]`
                            : emailText || '[No raw RFC 822 source in memory buffer]'}
                        </div>
                      )}

                      {inspectorTab === 'method' && (
                        <div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
                            <strong>Pipeline Methodology:</strong> {result.method}. Combined risk score evaluates heuristic rule hits alongside experimental statistical inference.
                          </p>
                          <ul className="limitations-list">
                            {result.limitations?.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          Footer: Team Credits & Hackathon Information
          ==================================================================== */}
      <footer className="soc-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <div className="footer-team-title">
              <span>TEAM CODE BLOODED</span>
              <span className="footer-team-badge">DEFENSE LABS</span>
            </div>
            <div className="footer-members">
              Devansh Chauhan • Rishant Chauhan • Srinivasa Moorty
            </div>
            <div className="footer-event">
              CODE YUDH — Department of Computer Science &amp; Engineering, Chandigarh University
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-disclaimer">
              Advisory triage platform. Zero automatic link execution. Sensitive operational decisions should be verified through authenticated secondary channels.
            </div>
            <div className="footer-tech">
              ENGINE: REACT + VITE // FASTAPI // SCIKIT-LEARN
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
