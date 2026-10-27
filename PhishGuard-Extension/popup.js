/* ============================================================================
   PhishGuard Chrome Extension - Popup Script
   Supports 1-click active tab extraction from Gmail/Outlook, demo vectors,
   accordion manual triage, and result rendering.
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  const instantDetectBox = document.getElementById('instant-detect-box');
  const instantScanBtn = document.getElementById('instant-scan-btn');
  const instantScanText = document.getElementById('instant-scan-text');
  const detectSub = document.getElementById('detect-sub');

  const manualToggleBtn = document.getElementById('manual-toggle-btn');
  const manualToggleIcon = document.getElementById('manual-toggle-icon');
  const manualBody = document.getElementById('manual-body');

  const emailInput = document.getElementById('email-input');
  const charCount = document.getElementById('char-count');
  const scanBtn = document.getElementById('scan-btn');
  const scanBtnText = document.getElementById('scan-btn-text');

  const resultEmpty = document.getElementById('result-empty');
  const resultPanel = document.getElementById('result-panel');

  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  const apiUrlInput = document.getElementById('api-url-input');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const settingsToast = document.getElementById('settings-toast');

  const demoChips = document.querySelectorAll('.demo-chip');

  let detectedEmailData = null;

  function isWebmailUrl(url) {
    if (!url) return false;
    const u = url.toLowerCase();
    return u.includes('mail.google.com') ||
           u.includes('outlook') ||
           u.includes('office') ||
           u.includes('cloud.microsoft');
  }

  // ---------------------------------------------------------------------------
  // Demo Attack Vectors
  // ---------------------------------------------------------------------------
  const DEMO_SAMPLES = {
    quarantine: `From: hr-support@payroll-portal-auth.live
Subject: Immediate Action Required: Confirm Direct Deposit Details

Your monthly payroll deposit has been temporarily frozen due to inconsistent banking details. You must login to verify your identity and submit your credentials within 24 hours to prevent payment cancellation.

Click here to update your direct deposit: https://secure-login-microsoft.xyz/auth`,

    review: `From: accounts@partner-consulting.org
Subject: Q3 Consulting Services Invoice #8492

Hello team,

Attached is the itemized invoice for September deliverable milestones. Please review the hours logged and process payment per net-30 terms.

Project tracker: https://partner-consulting.org/portal/invoices`,

    allow: `From: communications@internal-company.com
Subject: Monthly All-Hands Meeting Agenda - October

Hi everyone,

Join us this Thursday at 3 PM for our monthly engineering town hall. We will discuss product milestones, recent customer feedback, and quarterly targets.

See you all there,
Internal Comms Team`,
  };

  // ---------------------------------------------------------------------------
  // Tab Navigation
  // ---------------------------------------------------------------------------
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });

  // ---------------------------------------------------------------------------
  // Auto-Detect Current Open Email in Active Tab (Gmail & Outlook)
  // ---------------------------------------------------------------------------
  probeActiveTab();

  async function probeActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        detectSub.textContent = 'No active browser tab found.';
        instantScanBtn.disabled = true;
        return;
      }

      const url = tab.url || '';
      const isMail = isWebmailUrl(url);

      if (isMail) {
        const isGmail = url.includes('mail.google.com');
        detectSub.textContent = isGmail ? 'Gmail detected — checking open message...' : 'Outlook detected — ready to scan...';
        instantScanBtn.disabled = false;

        chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ACTIVE_EMAIL' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            // Keep button enabled on Outlook so user can click to trigger on-demand scan
            detectSub.textContent = isGmail ? 'Open an email on Gmail to scan.' : 'Outlook email open — click below to scan.';
            instantScanBtn.disabled = false;
            instantScanText.textContent = 'Scan Open Email Now';
            return;
          }

          detectedEmailData = response;
          const preview = response.subject || response.sender || 'Active message detected';
          detectSub.innerHTML = `<span style="color:#22d3ee;font-weight:600;">Found:</span> "${escapeHtml(preview.substring(0, 36))}${preview.length > 36 ? '...' : ''}"`;
          instantScanBtn.disabled = false;
          instantScanBtn.classList.add('ready');
          instantScanText.textContent = 'Scan This Email Now';
        });
      } else {
        detectSub.innerHTML = '<span style="color:#94a3b8;">Active tab is not a supported webmail (Gmail / Outlook).</span>';
        instantScanBtn.disabled = true;
        instantScanText.textContent = 'Webmail Not Active';
      }
    } catch (e) {
      detectSub.textContent = 'Open Gmail or Outlook to auto-scan.';
      instantScanBtn.disabled = true;
    }
  }

  // ---------------------------------------------------------------------------
  // 1-Click Instant Scan Handler
  // ---------------------------------------------------------------------------
  instantScanBtn.addEventListener('click', async () => {
    instantScanBtn.disabled = true;
    instantScanText.textContent = 'EXTRACTING & ANALYZING...';

    if (detectedEmailData?.raw) {
      executeAnalysis(detectedEmailData.raw);
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        if (!isWebmailUrl(tab.url)) {
          instantScanBtn.disabled = true;
          instantScanText.textContent = 'Webmail Not Active';
          return;
        }

        // Send message to extract email
        chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ACTIVE_EMAIL' }, (response) => {
          if (response?.raw) {
            executeAnalysis(response.raw);
          } else {
            // Direct script fallback on Outlook tabs to grab the reading pane text directly
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                const readingPane = document.querySelector('[role="main"]') || document.body;
                return readingPane ? readingPane.innerText : '';
              }
            }, (results) => {
              const text = results?.[0]?.result || '';
              if (text && text.length > 30) {
                executeAnalysis(text.substring(0, 50000));
              } else {
                instantScanBtn.disabled = false;
                instantScanText.textContent = 'Select an email first. Retry';
              }
            });
          }
        });
      }
    } catch {
      instantScanBtn.disabled = false;
      instantScanText.textContent = 'Scan Failed';
    }
  });

  function executeAnalysis(textPayload) {
    chrome.runtime.sendMessage({ type: 'ANALYSE_EMAIL', text: textPayload }, (result) => {
      instantScanBtn.disabled = false;
      instantScanText.textContent = 'Scan Open Email Now';

      if (result) {
        renderResult(result);
        switchToTab('result');
      }
    });
  }

  function switchToTab(tabName) {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
  }

  // ---------------------------------------------------------------------------
  // Manual Input Section Toggle
  // ---------------------------------------------------------------------------
  manualToggleBtn.addEventListener('click', () => {
    const isHidden = manualBody.classList.contains('hidden');
    if (isHidden) {
      manualBody.classList.remove('hidden');
      manualToggleIcon.textContent = '−';
    } else {
      manualBody.classList.add('hidden');
      manualToggleIcon.textContent = '+';
    }
  });

  // ---------------------------------------------------------------------------
  // Textarea & Char Count
  // ---------------------------------------------------------------------------
  emailInput.addEventListener('input', () => {
    const len = emailInput.value.length;
    charCount.textContent = `${len.toLocaleString()} chars`;
    scanBtn.disabled = len < 5;
  });

  // ---------------------------------------------------------------------------
  // Demo Sample Chips
  // ---------------------------------------------------------------------------
  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.sample;
      if (DEMO_SAMPLES[key]) {
        manualBody.classList.remove('hidden');
        manualToggleIcon.textContent = '−';
        emailInput.value = DEMO_SAMPLES[key];
        emailInput.dispatchEvent(new Event('input'));
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Backend Health Check
  // ---------------------------------------------------------------------------
  chrome.runtime.sendMessage({ type: 'CHECK_BACKEND' }, (status) => {
    if (chrome.runtime.lastError) status = 'offline';
    statusDot.className = `status-dot ${status || 'offline'}`;
    statusText.textContent = status === 'online' ? 'Backend Online' : 'Local Engine';
  });

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  chrome.storage.local.get('apiUrl', (data) => {
    apiUrlInput.value = data.apiUrl || 'http://127.0.0.1:8000';
  });

  saveSettingsBtn.addEventListener('click', () => {
    const url = apiUrlInput.value.trim().replace(/\/+$/, '');
    chrome.storage.local.set({ apiUrl: url || 'http://127.0.0.1:8000' }, () => {
      settingsToast.classList.remove('hidden');
      setTimeout(() => settingsToast.classList.add('hidden'), 2500);
      chrome.runtime.sendMessage({ type: 'CHECK_BACKEND' }, (status) => {
        if (chrome.runtime.lastError) status = 'offline';
        statusDot.className = `status-dot ${status || 'offline'}`;
        statusText.textContent = status === 'online' ? 'Backend Online' : 'Local Engine';
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Manual Scan Button
  // ---------------------------------------------------------------------------
  scanBtn.addEventListener('click', () => {
    const text = emailInput.value.trim();
    if (text.length < 5) return;

    scanBtn.disabled = true;
    scanBtnText.textContent = 'TRIAGING...';

    executeAnalysis(text);
    scanBtn.disabled = false;
    scanBtnText.textContent = 'RUN CUSTOM TRIAGE';
  });

  // ---------------------------------------------------------------------------
  // Load Previous Analysis Result
  // ---------------------------------------------------------------------------
  chrome.runtime.sendMessage({ type: 'GET_LAST_RESULT' }, (result) => {
    if (chrome.runtime.lastError) return;
    if (result) renderResult(result);
  });

  // ---------------------------------------------------------------------------
  // Render Result Helper
  // ---------------------------------------------------------------------------
  function renderResult(result) {
    resultEmpty.classList.add('hidden');
    resultPanel.classList.remove('hidden');

    const score = result.risk_score ?? 0;
    const action = result.recommended_action || 'REVIEW';
    const scoreClass = score >= 60 ? 'score-high' : score >= 25 ? 'score-medium' : 'score-low';
    const verdictClass = action === 'QUARANTINE' ? 'verdict-quarantine' : action === 'ALLOW' ? 'verdict-allow' : 'verdict-review';

    const verdictLabel = action === 'QUARANTINE' ? 'QUARANTINE // HIGH RISK'
      : action === 'ALLOW' ? 'ALLOW // BENIGN'
      : 'REVIEW // SUSPICIOUS';

    const verdictIconSvg = action === 'QUARANTINE'
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
      : action === 'ALLOW'
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (Math.min(100, Math.max(0, score)) / 100) * circ;

    const rulesScore = result.score_breakdown?.rules ?? 0;
    const mlScore = result.score_breakdown?.ml ?? 0;
    const repScore = result.score_breakdown?.reputation ?? 0;
    const indicators = result.indicators || [];

    let html = `
      <div class="verdict-card ${verdictClass}">
        <div class="verdict-row">
          <div class="verdict-icon-box">${verdictIconSvg}</div>
          <div>
            <div class="verdict-kicker">VERDICT: ${action}</div>
            <div class="verdict-main">${verdictLabel}</div>
          </div>
        </div>
        <div class="verdict-summary">${escapeHtml(result.summary || '')}</div>
        ${result.local_mode ? '<div class="local-badge">⚡ LOCAL ENGINE — Rules + Threat-Intel</div>' : ''}
      </div>

      <div class="score-section">
        <div class="score-gauge">
          <div class="gauge-ring-container">
            <svg class="gauge-svg" viewBox="0 0 70 70">
              <circle class="gauge-bg" cx="35" cy="35" r="${radius}" />
              <circle class="gauge-progress ${scoreClass}" cx="35" cy="35" r="${radius}"
                stroke-dasharray="${circ}" stroke-dashoffset="${offset}" />
            </svg>
            <div class="gauge-text">
              <span class="gauge-value">${score}</span>
              <span class="gauge-label">/ 100</span>
            </div>
          </div>
          <div class="pillar-bars">
            <div class="pillar-row">
              <div class="pillar-header"><span>Rules Heuristics</span><strong>${rulesScore}/100</strong></div>
              <div class="pillar-track"><div class="pillar-fill" style="width:${rulesScore}%;background:#38bdf8;"></div></div>
            </div>
            <div class="pillar-row">
              <div class="pillar-header"><span>ML Classifier</span><strong>${mlScore}/100</strong></div>
              <div class="pillar-track"><div class="pillar-fill" style="width:${mlScore}%;background:#a855f7;"></div></div>
            </div>
            <div class="pillar-row">
              <div class="pillar-header"><span>Threat Intel / TLD</span><strong>${repScore}/100</strong></div>
              <div class="pillar-track"><div class="pillar-fill" style="width:${repScore}%;background:#f59e0b;"></div></div>
            </div>
          </div>
        </div>
      </div>

      ${result.sender || result.subject ? `
        <div class="email-meta-strip">
          ${result.sender ? `<div><span class="meta-label">SENDER:</span> <span class="meta-val">${escapeHtml(result.sender)}</span></div>` : ''}
          ${result.subject ? `<div><span class="meta-label">SUBJECT:</span> <span class="meta-val">${escapeHtml(result.subject)}</span></div>` : ''}
        </div>
      ` : ''}

      ${indicators.length > 0 ? `
        <div class="signals-section">
          <div class="signals-header">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            EVIDENCE TREE (${indicators.length} SIGNALS)
          </div>
          ${indicators.map((ind, i) => `
            <div class="signal-item" data-idx="${i}">
              <span class="signal-severity severity-${ind.severity}">${ind.severity}</span>
              <span class="signal-text" title="${escapeHtml(ind.title)}">${escapeHtml(ind.title)}</span>
              <span class="signal-points">+${ind.points}</span>
            </div>
            <div class="signal-detail" id="detail-${i}">
              <div>${escapeHtml(ind.explanation || '')}</div>
              ${ind.evidence ? `<div class="signal-evidence">${escapeHtml(ind.evidence)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `<div style="text-align:center;color:var(--emerald-400);font-size:12px;padding:16px;">✓ Clean: No malicious signals identified.</div>`}
    `;

    resultPanel.innerHTML = html;

    resultPanel.querySelectorAll('.signal-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = item.dataset.idx;
        const detail = document.getElementById(`detail-${idx}`);
        if (detail) detail.classList.toggle('expanded');
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
