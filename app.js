const state = {
  weddingDate: new Date('2026-10-12T08:00:00+07:00').getTime(),
  galleryIndex: 1,
  galleryTotal: 6,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('to') || params.get('nama') || params.get('guest');
  if (!raw) return 'Tamu Undangan';
  return raw.replace(/\+/g, ' ').trim().slice(0, 80) || 'Tamu Undangan';
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
  const items = $$('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
  items.forEach((item) => observer.observe(item));
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    showToast('Berhasil disalin ✓');
  } catch {
    showToast('Tidak dapat menyalin otomatis');
  }
}

function setupCopyButtons() {
  $$('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => copyText(button.dataset.copy));
  });
}

function setupRSVP() {
  const form = $('#rsvpForm');
  const status = $('#rsvpStatus');
  const messages = $('#messages');
  if (!form || !messages) return;

  let cached = [];
  try { cached = JSON.parse(localStorage.getItem('undangan_rsvp_demo') || '[]'); } catch { cached = []; }

  const render = () => {
    messages.innerHTML = cached.slice(-12).reverse().map((item) => `
      <div class="message">
        <strong>${escapeHtml(item.name)}</strong>
        <p>${escapeHtml(item.attendance)} · ${Number(item.guests) || 1} tamu</p>
        <p>${escapeHtml(item.message || 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.')}</p>
      </div>
    `).join('');
  };
  render();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const entry = {
      name: String(data.name).trim().slice(0, 80),
      attendance: data.attendance,
      guests: Math.min(5, Math.max(1, Number(data.guests) || 1)),
      message: String(data.message || '').trim().slice(0, 300),
      created_at: new Date().toISOString(),
    };
    cached.push(entry);
    cached = cached.slice(-50);
    try { localStorage.setItem('undangan_rsvp_demo', JSON.stringify(cached)); } catch {}
    status.textContent = 'Ucapan berhasil disimpan di perangkat ini (mode demo).';
    form.reset();
    form.guests.value = '1';
    render();
    showToast('Ucapan tersimpan ✓');
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function setupMusic() {
  const button = $('#musicBtn');
  const audio = $('#bgMusic');
  if (!button || !audio) return;
  button.addEventListener('click', async () => {
    if (!audio.src) {
      showToast('Tambahkan file musik untuk mengaktifkan audio');
      return;
    }
    try {
      if (audio.paused) {
        await audio.play();
        button.textContent = '❚❚';
        button.setAttribute('aria-label', 'Jeda musik');
      } else {
        audio.pause();
        button.textContent = '♫';
        button.setAttribute('aria-label', 'Putar musik');
      }
    } catch { showToast('Musik belum dapat diputar'); }
  });
}

function setupOpen() {
  const opening = $('#opening');
  const site = $('#site');
  const guest = $('#guestName');
  const button = $('#openInvitation');
  if (!opening || !site || !button) return;
  if (guest) guest.textContent = getGuestName();
  document.body.style.overflow = 'hidden';
  button.addEventListener('click', () => {
    opening.classList.add('hidden');
    site.classList.remove('hidden');
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
    revealOnScroll();
    try { sessionStorage.setItem('undangan_opened', '1'); } catch {}
  });
}

function setupGallery() {
  const lightbox = $('#lightbox');
  const number = $('#lightboxNumber');
  const close = $('#closeLightbox');
  const prev = $('#prevGallery');
  const next = $('#nextGallery');
  if (!lightbox || !number) return;

  const render = () => { number.textContent = String(state.galleryIndex).padStart(2, '0'); };
  const open = (index) => {
    state.galleryIndex = index;
    render();
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const hide = () => {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  $$('[data-gallery]').forEach((item) => item.addEventListener('click', () => open(Number(item.dataset.gallery))));
  close?.addEventListener('click', hide);
  prev?.addEventListener('click', () => { state.galleryIndex = state.galleryIndex <= 1 ? state.galleryTotal : state.galleryIndex - 1; render(); });
  next?.addEventListener('click', () => { state.galleryIndex = state.galleryIndex >= state.galleryTotal ? 1 : state.galleryIndex + 1; render(); });
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) hide(); });
  document.addEventListener('keydown', (event) => {
    if (lightbox.classList.contains('hidden')) return;
    if (event.key === 'Escape') hide();
    if (event.key === 'ArrowLeft') prev?.click();
    if (event.key === 'ArrowRight') next?.click();
  });
}

function setupCalendar() {
  const button = $('#calendarBtn');
  if (!button) return;
  button.addEventListener('click', () => {
    const start = '20261012T080000';
    const end = '20261012T140000';
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Undangan//Wedding//ID','BEGIN:VEVENT',`DTSTART;TZID=Asia/Jakarta:${start}`,`DTEND;TZID=Asia/Jakarta:${end}`,'SUMMARY:Wedding Arkan & Nabila','LOCATION:Purwokerto, Jawa Tengah','DESCRIPTION:Akad dan resepsi Arkan & Nabila','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'wedding-arkan-nabila.ics'; link.click();
    URL.revokeObjectURL(url);
    showToast('File kalender dibuat ✓');
  });
}

function setupStreaming() {
  $('#streamBtn')?.addEventListener('click', () => showToast('Link streaming akan aktif pada hari acara'));
}

function setupSmoothNav() {
  $$('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

setupOpen();
setupMusic();
setupCopyButtons();
setupRSVP();
setupGallery();
setupCalendar();
setupStreaming();
setupSmoothNav();
updateCountdown();
setInterval(updateCountdown, 1000);
