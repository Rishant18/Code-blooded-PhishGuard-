/* ============================================================================
   PhishGuard Chrome Extension - Content Script
   Auto-detects active emails, injects real-time floating shields & banners,
   and supports 1-click active tab extraction for the popup.
   ============================================================================ */

(() => {
  'use strict';

  let scannedContainers = new WeakSet();
  let currentActiveEmailData = null;

  function isOutlookHost() {
    const h = location.hostname.toLowerCase();
    return h.includes('outlook') || h.includes('office') || h.includes('cloud.microsoft');
  }

  function isGmailHost() {
    return location.hostname.toLowerCase().includes('mail.google.com');
  }

  // ---------------------------------------------------------------------------
  // Message Listener for Popup & Background
  // ---------------------------------------------------------------------------
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'EXTRACT_ACTIVE_EMAIL') {
      const emailData = extractCurrentlyViewedEmail();
      sendResponse(emailData);
      return true;
    }
  });

  // ---------------------------------------------------------------------------
  // Email Extraction Logic (STRICTLY Webmail Only: Gmail + Outlook)
  // ---------------------------------------------------------------------------
  function extractCurrentlyViewedEmail() {
    if (isGmailHost()) {
      return extractGmailCurrent();
    } else if (isOutlookHost()) {
      return extractOutlookCurrent();
    }
    return null;
  }

  function extractGmailCurrent() {
    const subjectEl = document.querySelector('h2.hP, .hP');
    const subject = subjectEl ? subjectEl.textContent.trim() : '';

    const messageContainers = document.querySelectorAll('.adn.ads, .ii.gt, div[role="main"] .gs');
    let bestContainer = null;
    let sender = '';
    let body = '';

    for (let el of messageContainers) {
      if (el.offsetParent !== null) {
        bestContainer = el;
        const senderEl = el.querySelector('.gD, .go, span[email]');
        if (senderEl) {
          sender = senderEl.getAttribute('email') || senderEl.textContent.trim();
        }
        const bodyEl = el.querySelector('.a3s.aiL, .ii.gt, .a3s') || el;
        body = bodyEl.innerText || bodyEl.textContent || '';
        break;
      }
    }

    if (!body && bestContainer) {
      body = bestContainer.innerText || '';
    }

    if (!sender) {
      const senderFallback = document.querySelector('span[email], .gD');
      if (senderFallback) sender = senderFallback.getAttribute('email') || senderFallback.textContent.trim();
    }

    if (!body && !subject) return null;

    let raw = '';
    if (sender) raw += `From: ${sender}\n`;
    if (subject) raw += `Subject: ${subject}\n\n`;
    raw += body;

    const data = { provider: 'gmail', sender, subject, body, raw };
    currentActiveEmailData = data;
    return data;
  }

  function extractOutlookCurrent() {
    // 1. Subject extraction
    let subject = '';
    const subjectSelectors = [
      'div[role="heading"][aria-level="2"]',
      'div[role="heading"][aria-level="1"]',
      '[aria-label*="Subject"]',
      '.SubjectText',
      '[data-testid="message-subject"]',
      'span[title][class*="subject"]',
      'div[class*="Subject"]'
    ];
    for (let sel of subjectSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText && el.innerText.trim().length > 1) {
        subject = el.innerText.trim();
        break;
      }
    }

    // 2. Sender extraction
    let sender = '';
    const senderSelectors = [
      '[aria-label*="From:"]',
      '[aria-label*="From"]',
      'span[title*="@"]',
      'span[title*="<"]',
      '.personaTitle',
      'button[aria-label*="sender" i]',
      'div[class*="sender" i] span',
      'div[class*="Sender"]'
    ];
    for (let sel of senderSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const val = el.getAttribute('title') || el.getAttribute('aria-label') || el.innerText || '';
        if (val.trim()) {
          sender = val.replace(/^From:\s*/i, '').trim();
          break;
        }
      }
    }

    // 3. Body extraction (Direct reading pane message body)
    let body = '';
    const bodySelectors = [
      '[aria-label="Message body"]',
      '[aria-label*="Message body"]',
      'div[id*="Item.MessageUniqueBody"]',
      '.ReadingPaneContainer [role="document"]',
      'div[class*="ReadingPane"] div[class*="messageBody"]',
      '.ReadingPaneContainer',
      '.ReadMsgBody',
      '.ExternalClass',
      '.rps_',
      '[role="main"]'
    ];

    for (let sel of bodySelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.innerText || el.textContent || '').trim();
        if (text && !text.includes('Select an item to read') && !text.includes('Nothing is selected')) {
          body = text;
          break;
        }
      }
    }

    // Fallback: If in message view URL and reading pane text wasn't found through specific selectors
    if (!body && location.href.includes('/mail/id/') || location.href.includes('/mail/inbox/id/')) {
      const mainEl = document.querySelector('[role="main"]') || document.body;
      const text = (mainEl.innerText || '').trim();
      if (text.length > 30) {
        body = text;
      }
    }

    if (!body && !subject) return null;

    let raw = '';
    if (sender) raw += `From: ${sender}\n`;
    if (subject) raw += `Subject: ${subject}\n\n`;
    raw += body;

    const data = {
      provider: 'outlook',
      sender: sender || 'Sender identified in reading pane',
      subject: subject || 'Outlook Message',
      body,
      raw
    };
    currentActiveEmailData = data;
    return data;
  }

  // ---------------------------------------------------------------------------
  // Automatic UI Enhancement: Scan Buttons & Auto-Scan Badges
  // ---------------------------------------------------------------------------
  function processGmail() {
    const emailContainers = document.querySelectorAll('.adn.ads');
    emailContainers.forEach(container => {
      if (scannedContainers.has(container)) return;
      scannedContainers.add(container);

      if (container.querySelector('.phishguard-toolbar-badge')) return;

      const bodyEl = container.querySelector('.a3s.aiL, .ii.gt') || container;
      injectSmartScanBar(container, bodyEl, 'gmail');
    });
  }

  function processOutlook() {
    const readingPanes = document.querySelectorAll(
      '[aria-label="Message body"], [aria-label*="Message body"], .ReadingPaneContainer, .ReadMsgBody'
    );
    readingPanes.forEach(container => {
      if (container.innerText && (container.innerText.includes('Select an item to read') || container.innerText.includes('Nothing is selected'))) {
        return;
      }

      if (scannedContainers.has(container)) return;
      scannedContainers.add(container);

      if (container.parentElement?.querySelector('.phishguard-toolbar-badge')) return;
      injectSmartScanBar(container, container, 'outlook');
    });
  }

  function injectSmartScanBar(container, bodyEl, provider) {
    const bar = document.createElement('div');
    bar.className = 'phishguard-smart-bar';

    bar.innerHTML = `
      <div class="phishguard-bar-content">
        <div class="phishguard-bar-brand">
          <svg class="phishguard-shield-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span class="phishguard-bar-title">PhishGuard Protection</span>
        </div>
        <button class="phishguard-auto-scan-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>1-Click Scan Email</span>
        </button>
      </div>
    `;

    const scanBtn = bar.querySelector('.phishguard-auto-scan-btn');
    scanBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      scanBtn.disabled = true;
      scanBtn.innerHTML = `
        <span class="phishguard-spinner"></span>
        <span>Analyzing with Hybrid AI...</span>
      `;

      let mailData = extractCurrentlyViewedEmail();
      const rawText = mailData ? mailData.raw : (bodyEl.innerText || '');

      chrome.runtime.sendMessage({
        type: 'ANALYSE_EMAIL',
        text: rawText.substring(0, 100000)
      }, (result) => {
        if (result) {
          renderInlineReport(bar, result);
        } else {
          scanBtn.disabled = false;
          scanBtn.innerHTML = `<span>Scan Failed. Retry</span>`;
        }
      });
    });

    if (provider === 'gmail') {
      const emailHeader = container.querySelector('.gE.iv.gt, .adn') || container.firstElementChild;
      if (emailHeader) {
        emailHeader.parentElement.insertBefore(bar, emailHeader.nextSibling);
      } else {
        container.insertBefore(bar, container.firstChild);
      }
    } else {
      container.parentElement?.insertBefore(bar, container);
    }
  }

  function renderInlineReport(bar, result) {
    const score = result.risk_score ?? 0;
    const action = result.recommended_action || 'REVIEW';
    const isQuarantine = action === 'QUARANTINE';
    const isReview = action === 'REVIEW';

    const statusTheme = isQuarantine ? 'danger' : isReview ? 'warning' : 'safe';
    const statusIcon = isQuarantine ? '🛑' : isReview ? '⚠️' : '🛡️';
    const verdictText = isQuarantine ? 'HIGH RISK PHISHING DETECTED' : isReview ? 'SUSPICIOUS EMAIL - CAUTION' : 'LEGITIMATE / BENIGN EMAIL';

    bar.className = `phishguard-smart-bar phishguard-report-${statusTheme}`;
    bar.innerHTML = `
      <div class="phishguard-report-header">
        <div class="phishguard-badge-left">
          <span class="phishguard-icon-large">${statusIcon}</span>
          <div>
            <div class="phishguard-headline">${verdictText}</div>
            <div class="phishguard-subheadline">
              Risk Score: <strong>${score}/100</strong> (${action}) 
              • Rules: ${result.score_breakdown?.rules ?? 0} 
              • ML: ${result.score_breakdown?.ml ?? 0} 
              • Intel: ${result.score_breakdown?.reputation ?? 0}
              ${result.local_mode ? ' • <em>(Local Heuristics)</em>' : ''}
            </div>
          </div>
        </div>
        <div class="phishguard-badge-right">
          <button class="phishguard-toggle-signals-btn">Details (${result.indicators?.length || 0})</button>
          <button class="phishguard-close-btn" title="Dismiss">✕</button>
        </div>
      </div>
      <div class="phishguard-expanded-signals" style="display:none;">
        <p class="phishguard-summary-desc">${result.summary || ''}</p>
        ${result.indicators && result.indicators.length > 0 ? `
          <div class="phishguard-signals-grid">
            ${result.indicators.map(ind => `
              <div class="phishguard-signal-card phishguard-sev-${ind.severity}">
                <div class="phishguard-signal-top">
                  <span class="phishguard-pill">${ind.severity.toUpperCase()}</span>
                  <span class="phishguard-sig-title">${ind.title}</span>
                  <span class="phishguard-pts">+${ind.points} pts</span>
                </div>
                <div class="phishguard-sig-exp">${ind.explanation}</div>
                ${ind.evidence ? `<div class="phishguard-sig-ev">${ind.evidence}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<div class="phishguard-clean-msg">✓ No phishing heuristics or blacklisted domains flagged.</div>'}
      </div>
    `;

    const toggleBtn = bar.querySelector('.phishguard-toggle-signals-btn');
    const signalsBlock = bar.querySelector('.phishguard-expanded-signals');
    toggleBtn.addEventListener('click', () => {
      const isHidden = signalsBlock.style.display === 'none';
      signalsBlock.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide Details' : `Details (${result.indicators?.length || 0})`;
    });

    bar.querySelector('.phishguard-close-btn').addEventListener('click', () => {
      bar.remove();
    });
  }

  // ---------------------------------------------------------------------------
  // Observer for dynamic webmail DOM changes
  // ---------------------------------------------------------------------------
  const domObserver = new MutationObserver(() => {
    if (isGmailHost()) {
      processGmail();
    } else if (isOutlookHost()) {
      processOutlook();
    }
  });

  domObserver.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    if (isGmailHost()) processGmail();
    else if (isOutlookHost()) processOutlook();
  }, 1500);

})();
