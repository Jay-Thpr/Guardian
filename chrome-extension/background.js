const API_BASE = 'http://localhost:3000';
const ANALYSIS_CACHE_PREFIX = 'analysis:';
const PAGE_PROMPT_CACHE_PREFIX = 'pagePrompt:';

function isGovernmentUrl(url) {
  if (!url) return false;
  try {
    return new URL(url).hostname.toLowerCase().endsWith('.gov');
  } catch {
    return false;
  }
}

function toneFromResponse(data, url) {
  if (isGovernmentUrl(url)) return 'safe';
  const val = (data.classification || data.riskLevel || '').toLowerCase();
  if (val === 'risky') return 'danger';
  if (val === 'uncertain' || val === 'not-sure') return 'warning';
  return 'safe';
}

function isPromptworthyPage({ url, title, content }) {
  const text = `${url || ''} ${title || ''} ${content || ''}`.toLowerCase();
  return /\b(login|log in|sign in|signin|password|verify your account|authentication|continue with google|enter your details)\b/.test(text);
}

function buildPromptTone(data) {
  const val = (data?.riskLevel || '').toLowerCase();
  if (val === 'risky') return 'danger';
  if (val === 'uncertain' || val === 'not-sure') return 'warning';
  return 'safe';
}

function applyBadge(tone) {
  if (tone === 'danger') {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
  } else if (tone === 'warning') {
    chrome.action.setBadgeText({ text: '?' });
    chrome.action.setBadgeBackgroundColor({ color: '#d97706' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

async function loadTaskMemory() {
  try {
    const res = await fetch(`${API_BASE}/api/memory`, { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function buildPagePrompt({ url, title, content }) {
  const taskMemory = await loadTaskMemory();

  const res = await fetch(`${API_BASE}/api/copilot/respond`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'guidance',
      query: 'We moved to a new page. What should I do next?',
      url,
      pageTitle: title,
      visibleText: content?.slice(0, 4000) || '',
      pageSummary: content?.slice(0, 800) || '',
      taskMemory,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    title: data.summary || 'Next step',
    nextStep: data.nextStep || data.message || 'Continue carefully.',
    explanation: data.explanation || 'I checked the page and have a simple next step for you.',
    bullets: Array.isArray(data.suspiciousSignals) ? data.suspiciousSignals : [],
    tone: buildPromptTone(data),
  };
}

async function maybeSendPagePrompt(tabId, url, title, content) {
  if (!url || url.startsWith('chrome') || url.startsWith('about') || url.startsWith('extension')) return;
  if (!isPromptworthyPage({ url, title, content })) return;

  const cacheKey = `${PAGE_PROMPT_CACHE_PREFIX}${url}`;
  const cached = await chrome.storage.session.get(cacheKey).catch(() => ({}));
  if (cached[cacheKey]) {
    chrome.tabs.sendMessage(tabId, { type: 'SAFESTEP_PAGE_PROMPT', ...cached[cacheKey], url }).catch(() => {});
    return;
  }

  try {
    const prompt = await buildPagePrompt({ url, title, content });
    await chrome.storage.session.set({ [cacheKey]: prompt }).catch(() => {});
    chrome.tabs.sendMessage(tabId, { type: 'SAFESTEP_PAGE_PROMPT', ...prompt, url }).catch(() => {});
  } catch {
    // Silent fallback. The regular page analysis still runs.
  }
}

async function analyzeTab(tabId, url, title, content) {
  if (!url || url.startsWith('chrome') || url.startsWith('about') || url.startsWith('extension')) return;

  const cacheKey = `${ANALYSIS_CACHE_PREFIX}${url}`;
  const cached = await chrome.storage.session.get(cacheKey).catch(() => ({}));
  if (cached[cacheKey]) {
    applyBadge(cached[cacheKey].tone);
    if (cached[cacheKey].tone === 'danger') {
      chrome.tabs.sendMessage(tabId, { type: 'SAFESTEP_ALERT', ...cached[cacheKey] }).catch(() => {});
    } else {
      void maybeSendPagePrompt(tabId, url, title, content);
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/scam-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, pageTitle: title, content }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const tone = toneFromResponse(data, url);
    const bullets = Array.isArray(data.suspicious_signals) && data.suspicious_signals.length
      ? data.suspicious_signals : null;
    const explanation = data.explanation || 'I checked this page for you.';

    await chrome.storage.session.set({ [cacheKey]: { explanation, tone, bullets } }).catch(() => {});
    applyBadge(tone);

    if (tone === 'danger') {
      chrome.tabs.sendMessage(tabId, { type: 'SAFESTEP_ALERT', tone, explanation, bullets }).catch(() => {});
    } else {
      void maybeSendPagePrompt(tabId, url, title, content);
    }
  } catch {
    applyBadge('neutral');
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'PAGE_CONTENT' && sender.tab?.id) {
    analyzeTab(sender.tab.id, msg.url, msg.title, msg.content);
  }
});
