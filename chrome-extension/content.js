function showSafeStepAlert({ tone, explanation, bullets }) {
  if (document.getElementById('safestep-overlay')) return;

  const isDanger = tone === 'danger';
  const accentColor = isDanger ? '#dc2626' : '#d97706';
  const bgColor = isDanger ? '#7f1d1d' : '#78350f';

  const overlay = document.createElement('div');
  overlay.id = 'safestep-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 2147483647;
    background: rgba(0,0,0,0.72);
    display: flex; align-items: center; justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
    animation: ss-fade-in 0.2s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes ss-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ss-slide-in { from { transform: translateY(-32px) scale(0.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    @keyframes ss-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7), 0 24px 64px rgba(0,0,0,0.6); } 50% { box-shadow: 0 0 0 16px rgba(220,38,38,0), 0 24px 64px rgba(0,0,0,0.6); } }
    #safestep-card { animation: ss-slide-in 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    #safestep-card.danger { animation: ss-slide-in 0.3s cubic-bezier(0.34,1.56,0.64,1), ss-pulse 1.8s ease-in-out 0.3s 3; }
    #safestep-dismiss:hover { background: rgba(255,255,255,0.2) !important; }
    #safestep-proceed:hover { opacity: 0.8; }
  `;
  document.head.appendChild(style);

  const bulletsHtml = bullets && bullets.length
    ? `<ul style="margin:16px 0 0 0;padding-left:24px;font-size:17px;line-height:1.9;opacity:0.95;font-weight:500;">
        ${bullets.map(b => `<li>${b}</li>`).join('')}
       </ul>`
    : '';

  overlay.innerHTML = `
    <div id="safestep-card" class="${isDanger ? 'danger' : ''}" style="
      background: ${bgColor};
      border: 4px solid ${accentColor};
      border-radius: 20px;
      padding: 40px 40px 32px;
      max-width: 560px;
      width: 92%;
      color: #fff;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    ">
      <div style="font-size: 72px; text-align: center; margin-bottom: 20px; line-height: 1;">
        🚨
      </div>
      <h2 style="font-size: 30px; font-weight: 900; text-align: center; margin: 0 0 16px; line-height: 1.25; letter-spacing: -0.5px;">
        STOP — This page is dangerous
      </h2>
      <p style="font-size: 19px; line-height: 1.65; margin: 0; opacity: 0.97; text-align: center; font-weight: 500;">
        ${explanation}
      </p>
      ${bulletsHtml}
      <button id="safestep-dismiss" style="
        display: block; width: 100%; margin-top: 32px;
        padding: 18px; font-size: 20px; font-weight: 800;
        background: #fff; color: ${accentColor};
        border: none; border-radius: 12px;
        cursor: pointer; font-family: inherit; letter-spacing: 0.2px;
      ">✓ I understand — go back to safety</button>
      <button id="safestep-proceed" style="
        display: block; width: 100%; margin-top: 10px;
        padding: 12px; font-size: 15px; font-weight: 600;
        background: transparent; color: rgba(255,255,255,0.55);
        border: 1px solid rgba(255,255,255,0.25); border-radius: 10px;
        cursor: pointer; font-family: inherit;
      ">I know the risks — proceed anyway</button>
      <p style="font-size: 13px; text-align: center; margin: 16px 0 0; opacity: 0.5;">
        SafeStep · Your safety copilot
      </p>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('safestep-dismiss').onclick = () => overlay.remove();
  document.getElementById('safestep-proceed').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SAFESTEP_ALERT') {
    showSafeStepAlert(msg);
  }
});

// Send page content to background for analysis
chrome.runtime.sendMessage({
  type: 'PAGE_CONTENT',
  url: location.href,
  title: document.title,
  content: document.body?.innerText?.slice(0, 4000) || '',
});
