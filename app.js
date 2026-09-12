const state = {
  opened: false,
  musicOn: false,
  weddingDate: new Date('2026-10-12T08:00:00+07:00').getTime(),
};

const $ = (selector) => document.querySelector(selector);

function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  return params.get('to') || params.get('nama') || 'Tamu Undangan';
}

function updateCountdown() {
  const el = $('#countdown');
  if (!el) return;
  const diff = state.weddingDate - Date.now();
  if (diff <= 0) {
    el.innerHTML = '<div class="time-box"><strong>♥</strong><span>HARI BAHAGIA</span></div>';
    return;
  }
  const units = [
    ['Hari', Math.floor(diff / 86400000)],
    ['Jam', Math.floor(diff / 3600000) % 24],
    ['Menit', Math.floor(diff / 60000) % 60],
    ['Detik', Math.floor(diff / 1000) % 60],
  ];
  el.innerHTML = units.map(([label, value]) => `<div class="time-box"><strong>${String(value).padStart(2, '0')}</strong><span>${label.toUpperCase()}</span></div>`).join('');
}

function revealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = 'Tersalin ✓';
    setTimeout(() => { button.textContent = original; }, 1500);
  } catch {
    button.textContent = 'Gagal menyalin';
  }
}

function setupRSVP() {
  const form = $('#rsvpForm');
  const status = $('#rsvpStatus');
  const messages = $('#messages');
  if (!form) return;

  const cached = JSON.parse(localStorage.getItem('undangan_rsvp_demo') || '[]');
  const render = () => {
    messages.innerHTML = cached.slice().reverse().map((item) => `
      <div class="message">
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.attendance)} · ${item.guests} tamu</p>
        <p>${escapeHtml(item.message || 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.')}</p>
      </div>
    `).join('');
  };
  render();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    cached.push({ ...data, created_at: new Date().toISOString() });
    localStorage.setItem('undangan_rsvp_demo', JSON.stringify(cached));
    status.textContent = 'Ucapan berhasil disimpan di demo perangkat ini.';
    form.reset();
    form.guests.value = '1';
    render();
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function setupMusic() {
  const button = $('#musicBtn');
  const audio = $('#bgMusic');
  button?.addEventListener('click', async () => {
    if (!audio.src) {
      button.textContent = '♫';
      return;
    }
    try {
      if (audio.paused) {
        await audio.play();
        button.textContent = '❚❚';
        state.musicOn = true;
      } else {
        audio.pause();
        button.textContent = '♫';
        state.musicOn = false;
      }
    } catch {
      button.textContent = '♫';
    }
  });
}

function setupOpen() {
  $('#guestName').textContent = getGuestName();
  $('#openInvitation').addEventListener('click', () => {
    $('#opening').classList.add('hidden');
    $('#site').classList.remove('hidden');
    document.body.style.overflow = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
    revealOnScroll();
  });
}

document.body.style.overflow = 'hidden';
setupOpen();
setupMusic();
setupRSVP();
updateCountdown();
setInterval(updateCountdown, 1000);

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', () => copyText(button.dataset.copy, button));
}
