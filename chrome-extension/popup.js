const API_BASE = 'http://localhost:3000';

function showState(id) {
  ['state-loading', 'state-loaded', 'state-error'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

function renderAppointment(data) {
  document.getElementById('appt-location').classList.add('hidden');
  document.getElementById('prep-block').classList.add('hidden');

  const appt = data.appointment;

  if (!appt || typeof appt !== 'object') {
    // Connected but no upcoming appointments
    document.getElementById('appt-summary').textContent = 'No upcoming appointments found.';
    document.getElementById('appt-when').textContent = '';
    showState('state-loaded');
    return;
  }

  document.getElementById('appt-summary').textContent = appt.summary || 'Appointment';

  const when = [appt.whenLabel, appt.timeLabel].filter(Boolean).join(' at ');
  document.getElementById('appt-when').textContent = when;

  const locationEl = document.getElementById('appt-location');
  if (appt.location) {
    locationEl.textContent = appt.location;
    locationEl.classList.remove('hidden');
  }

  const prepBlock = document.getElementById('prep-block');
  const prepEl = document.getElementById('appt-prep');
  if (typeof data.prep_advice === 'string' && data.prep_advice) {
    prepEl.textContent = data.prep_advice;
    prepBlock.classList.remove('hidden');
  }

  showState('state-loaded');
}

document.addEventListener('DOMContentLoaded', () => {
  showState('state-loading');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  fetch(`${API_BASE}/api/appointments`, { signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => renderAppointment(data))
    .catch((err) => { console.error('[SafeStep] fetch error:', err); showState('state-error'); });
});
