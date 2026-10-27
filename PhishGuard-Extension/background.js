/* ============================================================================
   PhishGuard Chrome Extension - Background Service Worker
   Handles context menus, backend communication, and badge updates
   ============================================================================ */

const DEFAULT_API = 'http://127.0.0.1:8000';

// ---------------------------------------------------------------------------
// Context Menu Setup
// ---------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'phishguard-scan-selection',
    title: 'Scan with PhishGuard',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'phishguard-scan-page',
    title: 'Scan page text with PhishGuard',
    contexts: ['page'],
  });
});

// ---------------------------------------------------------------------------
// Context Menu Click Handler
// ---------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'phishguard-scan-selection' && info.selectionText) {
    const result = await analyseEmail(info.selectionText);
    if (result) {
      await chrome.storage.local.set({ lastResult: result });
      updateBadge(result.risk_score);
    }
  }
  if (info.menuItemId === 'phishguard-scan-page' && tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText,
    }, async (results) => {
      if (results?.[0]?.result) {
        const result = await analyseEmail(results[0].result.substring(0, 50000));
        if (result) {
          await chrome.storage.local.set({ lastResult: result });
          updateBadge(result.risk_score);
        }
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Message Handler (from popup and content scripts)
// ---------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ANALYSE_EMAIL') {
    analyseEmail(message.text).then((result) => {
      if (result) {
        chrome.storage.local.set({ lastResult: result });
        updateBadge(result.risk_score);
      }
      sendResponse(result);
    });
    return true; // keep channel open for async response
  }

  if (message.type === 'CHECK_BACKEND') {
    checkBackend().then(sendResponse);
    return true;
  }

  if (message.type === 'ANALYSE_LOCAL') {
    const result = analyseLocally(message.text);
    chrome.storage.local.set({ lastResult: result });
    updateBadge(result.risk_score);
    sendResponse(result);
    return true;
  }

  if (message.type === 'GET_LAST_RESULT') {
    chrome.storage.local.get('lastResult', (data) => {
      sendResponse(data.lastResult || null);
    });
    return true;
  }
});

// ---------------------------------------------------------------------------
// Backend API Communication
// ---------------------------------------------------------------------------
async function getApiUrl() {
  const data = await chrome.storage.local.get('apiUrl');
  return data.apiUrl || DEFAULT_API;
}

async function checkBackend() {
  try {
    const api = await getApiUrl();
    const res = await fetch(`${api}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok ? 'online' : 'offline';
  } catch {
    return 'offline';
  }
}

async function analyseEmail(text) {
  try {
    const api = await getApiUrl();
    const res = await fetch(`${api}/api/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_text: text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error('Backend error');
    return await res.json();
  } catch {
    // Fall back to local analysis if backend is unavailable
    return analyseLocally(text);
  }
}

// ---------------------------------------------------------------------------
// Local Analysis Engine (Rules + Reputation — no ML without backend)
// ---------------------------------------------------------------------------
function analyseLocally(raw) {
  const fullText = raw.toLowerCase();
  const indicators = [];
  let rulePoints = 0;

  function addRule(key, title, severity, points, evidence, explanation) {
    indicators.push({ pillar: 'Rules', key, title, severity, points, evidence, explanation });
    rulePoints += points;
  }

  // 1. Urgency heuristic
  const urgencyPattern = /\b(urgent|immediately|act now|action required|promptly|by the end of the day|within \d+ (?:hours?|days?)|account (?:will be )?suspended|disabled|unusual activity|final notice|final warning|limited time|expire(?:s|d)? today|avoid interruption|prevent unauthorized access|reserve your slot)\b/i;
  const urgencyMatch = fullText.match(urgencyPattern);
  if (urgencyMatch) {
    addRule('urgency', 'Urgent or pressure-driven call-to-action', 'medium', 25,
      `Matched phrase: "${urgencyMatch[0]}"`,
      'Call-to-action urgency pressures recipients to react quickly without independent verification.');
  }

  // 2. Credential harvesting
  const harvestPattern = /\b(password|passcode|login|log in|sign[ -]in|verify your identity|confirm your credentials|credentials|one-time password|otp|restore your permissions|confirm (?:your )?security settings|confirm (?:your )?account settings|candidate information form|candidate details|registration form)\b/i;
  const harvestMatch = fullText.match(harvestPattern);
  if (harvestMatch) {
    addRule('harvesting', 'Credential or personal data harvesting solicitation', 'high', 30,
      `Matched term: "${harvestMatch[0]}"`,
      'Direct solicitation of user credentials, personal registration data, or security configurations.');
  }

  // 3. Financial / impersonation lure
  const financialPattern = /\b(gift card|wire transfer|payment overdue|bank(?:ing)? (?:details|information)|update billing|direct deposit|salary payment|payroll profile|synchronization (?:has been )?paused|storage limit reached|quota exhausted)\b/i;
  const finMatch = fullText.match(financialPattern);
  if (finMatch) {
    addRule('lure_pattern', 'Resource interruption or financial diversion lure', 'high', 30,
      `Matched term: "${finMatch[0]}"`,
      'Simulates system service interruption, cloud quota suspension, or banking modifications.');
  }

  // 4. URL extraction
  const urls = extractUrls(raw);

  // 5. Sender domain extraction
  const senderMatch = raw.match(/^From:\s*.*?([a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/im);
  const senderDomain = senderMatch ? senderMatch[2].toLowerCase() : '';

  // 6. Domain mismatch
  if (senderDomain && urls.length > 0) {
    const urlDomains = urls.map(u => extractDomain(u)).filter(Boolean);
    const mismatched = urlDomains.filter(d =>
      d !== senderDomain && !d.endsWith('.' + senderDomain) && !senderDomain.endsWith('.' + d)
    );
    if (mismatched.length > 0) {
      addRule('domain_mismatch', 'Sender and destination domain mismatch', 'high', 30,
        `Sender domain '${senderDomain}' differs from destination '${mismatched[0]}'`,
        'The email originates from one organization domain while redirecting users to an external host.');
    }
  }

  // 7. Insecure HTTP links
  const insecureUrls = urls.filter(u => u.toLowerCase().startsWith('http://'));
  if (insecureUrls.length > 0) {
    addRule('insecure_transport', 'Unencrypted HTTP destination link', 'medium', 20,
      `Insecure link found: ${insecureUrls[0]}`,
      'Modern enterprise platforms enforce HTTPS. Plain HTTP links requesting actions indicate malicious intent.');
  }

  // 8. Reputation checks
  let reputationScore = 0;
  const SUSPICIOUS_TLDS = new Set(['top', 'xyz', 'buzz', 'click', 'rest', 'surf', 'fit', 'gq', 'ml', 'cf', 'tk', 'ga']);
  const TARGETED_BRANDS = ['microsoft', 'office365', 'google', 'paypal', 'apple', 'netflix', 'chase', 'wellsfargo', 'amazon', 'dropbox', 'docusign'];
  const BLOCKLIST = new Set([
    'secure-login-microsoft.xyz', 'verify-account-update.top', 'paypal-resolution-center.click',
    'update-payment-portal.info', 'payroll-portal-auth.live',
  ]);

  const allDomains = new Set();
  if (senderDomain) allDomains.add(senderDomain);
  urls.forEach(u => { const d = extractDomain(u); if (d) allDomains.add(d); });

  for (const dom of allDomains) {
    if (BLOCKLIST.has(dom)) {
      indicators.push({
        pillar: 'Reputation', key: 'ThreatIntel-Feed',
        title: 'Threat Intel: ThreatIntel-Feed', severity: 'high', points: 50,
        evidence: `Domain identified on threat blocklist: ${dom}`,
        explanation: 'Signal flagged from domain heuristics or threat intelligence blocklist.',
      });
      reputationScore += 50;
    }
    const parts = dom.split('.');
    if (parts.length >= 2 && SUSPICIOUS_TLDS.has(parts[parts.length - 1])) {
      indicators.push({
        pillar: 'Reputation', key: 'TLD-Heuristics',
        title: 'Threat Intel: TLD-Heuristics', severity: 'medium', points: 25,
        evidence: `Domain utilizes high-abuse TLD (.${parts[parts.length - 1]}): ${dom}`,
        explanation: 'Signal flagged from domain heuristics or threat intelligence blocklist.',
      });
      reputationScore += 25;
    }
    // Brand impersonation check
    const normalized = dom.replace(/0/g, 'o').replace(/1/g, 'l').replace(/vv/g, 'w').replace(/5/g, 's');
    for (const brand of TARGETED_BRANDS) {
      if (brand !== dom && brand !== dom.replace(/\..+$/, '')) {
        if (normalized.includes(brand) && !dom.includes(brand)) {
          indicators.push({
            pillar: 'Reputation', key: 'Brand-Impersonation',
            title: 'Threat Intel: Brand-Impersonation', severity: 'high', points: 35,
            evidence: `Possible typosquatting/lookalike of '${brand}' in '${dom}'`,
            explanation: 'Signal flagged from domain heuristics or threat intelligence blocklist.',
          });
          reputationScore += 35;
        } else if (dom.includes(brand) && !dom.endsWith(`.${brand}.com`) && dom !== `${brand}.com`) {
          indicators.push({
            pillar: 'Reputation', key: 'Brand-Impersonation',
            title: 'Threat Intel: Brand-Impersonation', severity: 'high', points: 35,
            evidence: `Brand keyword '${brand}' found in non-official domain '${dom}'`,
            explanation: 'Signal flagged from domain heuristics or threat intelligence blocklist.',
          });
          reputationScore += 35;
        }
      }
    }
  }

  reputationScore = Math.min(100, reputationScore);
  const ruleScore = Math.min(100, rulePoints);

  // Hybrid scoring (without ML, give rules more weight)
  let hybridScore;
  if (reputationScore > 0) {
    hybridScore = Math.round(0.55 * ruleScore + 0.45 * reputationScore);
  } else {
    hybridScore = ruleScore;
  }

  // Escalation logic
  if (reputationScore >= 50) hybridScore = Math.max(hybridScore, 80);
  const criticalRules = indicators.map(i => i.key);
  if (criticalRules.includes('domain_mismatch') && (criticalRules.includes('harvesting') || criticalRules.includes('lure_pattern'))) {
    hybridScore = Math.max(hybridScore, 74);
  }
  if (indicators.filter(i => i.pillar === 'Rules').length >= 3 && ruleScore >= 55) {
    hybridScore = Math.max(hybridScore, 72);
  }

  const finalScore = Math.min(100, Math.max(0, hybridScore));

  let action, verdict;
  if (finalScore >= 60) { action = 'QUARANTINE'; verdict = 'High Risk'; }
  else if (finalScore >= 25) { action = 'REVIEW'; verdict = 'Needs Review'; }
  else { action = 'ALLOW'; verdict = 'Lower Risk'; }

  // Extract sender and subject
  const subjectMatch = raw.match(/^Subject:\s*(.+)/im);
  const sender = senderMatch ? senderMatch[0].replace(/^From:\s*/i, '').trim() : 'Not identified';
  const subject = subjectMatch ? subjectMatch[1].trim() : 'No subject detected';

  return {
    sender,
    subject,
    risk_score: finalScore,
    score_breakdown: { rules: ruleScore, ml: 0, reputation: reputationScore },
    verdict,
    recommended_action: action,
    summary: `Assigned ${action} with overall risk score ${finalScore}/100. Signals: Rules (${ruleScore}), Threat-Intel (${reputationScore}). ML unavailable (local mode).`,
    indicators,
    urls,
    created_at: new Date().toISOString(),
    local_mode: true,
  };
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------
function extractUrls(text) {
  const found = text.match(/(?:https?:\/\/|www\.)[^\s<>"'()\]]+/gi) || [];
  const cleaned = [];
  for (const item of found) {
    const url = item.replace(/[.,;:!?]+$/, '');
    if (!cleaned.includes(url)) cleaned.push(url);
  }
  return cleaned.slice(0, 50);
}

function extractDomain(urlOrEmail) {
  let candidate = urlOrEmail.trim();
  if (candidate.includes('@')) candidate = candidate.split('@').pop();
  if (!/^https?:\/\//i.test(candidate)) candidate = 'http://' + candidate;
  try {
    const u = new URL(candidate);
    return (u.hostname || '').toLowerCase();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Badge Update
// ---------------------------------------------------------------------------
function updateBadge(score) {
  let color, text;
  if (score >= 60) {
    color = '#ef4444';
    text = String(score);
  } else if (score >= 25) {
    color = '#f59e0b';
    text = String(score);
  } else {
    color = '#10b981';
    text = score > 0 ? String(score) : '✓';
  }
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
}
