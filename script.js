"use strict";

/* ============================================================
   UNDANGAN PERNIKAHAN DIGITAL — script.js
   ------------------------------------------------------------
   KONFIGURASI UNDANGAN ADA DI PALING ATAS FILE INI.
   Ubah data di bawah ini (nama, tanggal, alamat, dll) tanpa
   perlu menyentuh kode di bawahnya.
   ============================================================ */

const CONFIG = {
  title: "The Wedding of Galang & Lili",

  couple: {
    groom: {
      firstName: "Galang",
      fullName: "Sevan Galang Prasetyo",
      role: "PUTRA PERTAMA DARI",
      parents: "Bapak Budi & Ibu Tri Wahyuni",
      instagram: "sevangalang",
      photo: "assets/images/groom.svg"
    },
    bride: {
      firstName: "Lili",
      fullName: "Lili Nafisa Nestya",
      role: "PUTRI KEDUA DARI",
      parents: "Bapak Sukin & Ibu Sumarni",
      instagram: "lilinafisa",
      photo: "assets/images/bride.svg"
    }
  },

  /* Tanggal pernikahan — dipakai untuk countdown & tampilan tanggal */
  wedding: {
    date: "2026-11-29T08:00:00+07:00",
    place: "Purwokerto, Jawa Tengah"
  },

  events: {
    akad: {
      date: "Minggu, 29 November 2026",
      time: "Pukul 08.00 – 10.00 WIB",
      venue: "Rumah Lili",
      address: "Jl. Jend. Sudirman No. 123, Purwokerto Timur, Banyumas, Jawa Tengah 53111",
      maps: "https://www.google.com/maps/search/?api=1&query=Masjid+Agung+Purwokerto"
    },
    resepsi: {
      date: "Minggu, 29 November 2026",
      time: "Pukul 11.00 – 14.00 WIB",
      venue: "Rumah Galang",
      address: "Jl. Jend. Sudirman No. 123, Purwokerto Timur, Banyumas, Jawa Tengah 53111",
      maps: "https://www.google.com/maps/search/?api=1&query=Purwokerto+Jawa+Tengah"
    }
  },

  story: [
    { year: "2018", title: "Pertama Bertemu", photo: "assets/images/gallery-1.svg",
      desc: "Kami bertemu pertama kali di sebuah acara organisasi kampus di Purwokerto. Sapaan singkat yang sederhana, namun meninggalkan kesan yang tak terlupakan." },
    { year: "2019", title: "Menjalin Persahabatan", photo: "assets/images/gallery-2.svg",
      desc: "Dari sekadar rekan, kami menjadi sahabat. Kopi, buku, dan obrolan panjang menemani setiap perjalanan kami." },
    { year: "2021", title: "Jatuh Cinta", photo: "assets/images/gallery-3.svg",
      desc: "Hati tidak pernah bisa berbohong. Perlahan, persahabatan itu tumbuh menjadi cinta yang saling menguatkan." },
    { year: "2023", title: "Lamaran", photo: "assets/images/gallery-4.svg",
      desc: "Dengan restu kedua keluarga, kami melangsungkan prosesi lamaran di kediaman keluarga. Bismillah, menuju ikatan yang lebih suci." },
    { year: "2026", title: "Menuju Pelaminan", photo: "assets/images/gallery-5.svg",
      desc: "Dengan penuh syukur, kami memantaskan diri untuk mengikat janji suci. Doa terbaik Anda adalah hadiah terindah bagi kami." }
  ],

  gallery: [
    { src: "assets/images/gallery-1.svg", caption: "Pre-wedding" },
    { src: "assets/images/gallery-2.svg", caption: "Momen Bahagia" },
    { src: "assets/images/gallery-3.svg", caption: "Kebersamaan" },
    { src: "assets/images/gallery-4.svg", caption: "Keluarga" },
    { src: "assets/images/gallery-5.svg", caption: "Pelaminan" },
    { src: "assets/images/gallery-6.svg", caption: "Detail Acara" }
  ],

  /* Kosongkan url untuk menampilkan placeholder elegan */
  video: {
    url: "",
    title: "Video Prewedding & Momen Bahagia"
  },

  gifts: {
    banks: [
      { name: "BCA", number: "1234567890", holder: "a.n. Sevan Galang Prasetyo" },
      { name: "BRI", number: "9876543210", holder: "a.n. Lili Nafisa Nestya" },
      { name: "Mandiri", number: "5551234567", holder: "a.n. Sevan Galang Prasetyo" }
    ],
    wallets: [
      { name: "DANA", number: "081234567890" },
      { name: "GoPay", number: "081234567890" },
      { name: "OVO", number: "081234567890" },
      { name: "ShopeePay", number: "081234567890" }
    ],
    address: "Jl. Jend. Sudirman No. 123, Purwokerto Timur, Banyumas, Jawa Tengah 53111",
    qris: "assets/images/qris.svg"
  },

  /* Letakkan file musik di assets/music/ lalu ubah path di bawah */
  music: "assets/music/weding.mp3"
};

/* ============================================================
   BANTUAN
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  let s = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ============================================================
   FIREBASE — inisialisasi dengan fallback yang aman.
   Jika Firebase belum diisi / gagal dimuat, website tetap
   berjalan dengan data default.
   ============================================================ */
const fbConfig = window.FIREBASE_CONFIG || null;
const firebaseOk =
  typeof firebase !== "undefined" &&
  fbConfig !== null &&
  window.FIREBASE_CONFIGURED === true;

let db = null;
if (firebaseOk) {
  try {
    firebase.initializeApp(fbConfig);
    db = firebase.firestore();
  } catch (err) {
    console.warn("Firebase gagal dimuat:", err);
    db = null;
  }
}

/* ============================================================
   NAMA TAMU DARI URL — contoh: /@mas-pri
   ============================================================ */
let guestName = "Bapak/Ibu/Saudara/i";

function getGuestUsername() {
  const m = window.location.pathname.match(/^\/@([\w.\-]+)/);
  return m ? m[1] : null;
}

async function loadGuest() {
  const username = getGuestUsername();
  if (!username || !db) return;
  try {
    const snap = await db.collection("guests").where("username", "==", username).limit(1).get();
    if (!snap.empty) {
      const data = snap.docs[0].data();
      if (data && data.name) guestName = data.name;
    }
  } catch (err) {
    console.warn("Gagal memuat nama tamu:", err);
  }
}

/* ============================================================
   KONFIGURASI DARI FIRESTORE (collection: config, doc: wedding)
   Jika ada, data Firestore menimpa data default di atas.
   ============================================================ */
async function loadConfigFromFirebase() {
  if (!db) return;
  try {
    const snap = await db.collection("config").doc("wedding").get();
    if (!snap.exists) return;
    const data = snap.data();
    const deep = (target, source) => {
      if (!source || typeof source !== "object") return;
      Object.keys(source).forEach((k) => {
        if (source[k] && typeof source[k] === "object" && !Array.isArray(source[k]) && target[k]) {
          deep(target[k], source[k]);
        } else if (source[k] !== undefined) {
          target[k] = source[k];
        }
      });
    };
    deep(CONFIG, data);
  } catch (err) {
    console.warn("Gagal memuat konfigurasi dari Firestore:", err);
  }
}

/* ============================================================
   ISI DATA KE HALAMAN
   ============================================================ */
function applyStatic() {
  const g = CONFIG.couple.groom;
  const b = CONFIG.couple.bride;

  document.title = CONFIG.title;

  /* Nama di hero & footer */
  const hnLines = $$(".hn-line");
  if (hnLines[0]) hnLines[0].textContent = g.firstName;
  if (hnLines[1]) hnLines[1].textContent = b.firstName;
  const greetNames = $("#greetNames");
  if (greetNames) {
    greetNames.innerHTML = g.firstName + ' <span class="amp">&amp;</span> ' + b.firstName;
  }
  const footNames = $(".foot-names");
  if (footNames) {
    footNames.innerHTML = g.firstName + ' <span class="amp">&amp;</span> ' + b.firstName;
  }

  /* Tanggal & lokasi */
  $("#heroDate").textContent = formatDateLong(CONFIG.wedding.date);
  $("#heroPlace").textContent = CONFIG.wedding.place;
  $("#footDate").textContent = formatDateShort(CONFIG.wedding.date);

  /* Mempelai */
  $("#groomName").textContent = g.fullName;
  $("#groomParents").textContent = g.parents;
  $("#groomImg").src = g.photo;
  $("#groomImg").alt = "Foto " + g.fullName;
  $("#groomIg").href = "https://instagram.com/" + g.instagram;
  $("#groomIgText").textContent = "@" + g.instagram;

  $("#brideName").textContent = b.fullName;
  $("#brideParents").textContent = b.parents;
  $("#brideImg").src = b.photo;
  $("#brideImg").alt = "Foto " + b.fullName;
  $("#brideIg").href = "https://instagram.com/" + b.instagram;
  $("#brideIgText").textContent = "@" + b.instagram;

  /* Acara */
  const e = CONFIG.events;
  $("#akadDate").textContent = e.akad.date;
  $("#akadTime").textContent = e.akad.time;
  $("#akadVenue").textContent = e.akad.venue;
  $("#akadAddress").textContent = e.akad.address;
  $("#akadMap").href = e.akad.maps;
  $("#resepsiDate").textContent = e.resepsi.date;
  $("#resepsiTime").textContent = e.resepsi.time;
  $("#resepsiVenue").textContent = e.resepsi.venue;
  $("#resepsiAddress").textContent = e.resepsi.address;
  $("#resepsiMap").href = e.resepsi.maps;

  /* Hadiah */
  $("#giftAddress").textContent = CONFIG.gifts.address;
  $("#copyAddressBtn").dataset.copy = CONFIG.gifts.address;
  $("#qrisImg").src = CONFIG.gifts.qris;
}

function setGuestNames() {
  const set = (sel) => {
    const el = $(sel);
    if (el) el.textContent = guestName;
  };
  set("#guestName");
  set("#heroGuest");
  set("#greetingGuest");
  set("#footerGuest");
}

/* Love Story */
function renderStory() {
  const wrap = $("#storyTimeline");
  if (!wrap) return;
  wrap.innerHTML = CONFIG.story.map((s, i) => {
    const photoSide = i % 2 === 0 ? "reveal-left" : "reveal-right";
    return (
      '<article class="tl-item reveal">' +
      '<span class="tl-dot" aria-hidden="true"></span>' +
      '<div class="tl-photo ' + photoSide + '"><img src="' + s.photo +
        '" alt="Momen ' + s.title + '" loading="lazy" decoding="async" /></div>' +
      '<div class="tl-body">' +
        '<span class="tl-date">' + s.year + "</span>" +
        "<h4>" + s.title + "</h4>" +
        "<p>" + s.desc + "</p>" +
      "</div></article>"
    );
  }).join("");
}

/* Galeri */
let galleryItems = [];
function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;
  galleryItems = CONFIG.gallery;
  grid.innerHTML = galleryItems.map((g, i) =>
    '<figure class="g-item" data-index="' + i + '" role="button" tabindex="0" aria-label="Lihat: ' + g.caption + '">' +
      '<img src="' + g.src + '" alt="' + g.caption + '" loading="lazy" decoding="async" />' +
      '<figcaption class="g-cap">' + g.caption + "</figcaption>" +
    "</figure>"
  ).join("");
}

/* Video */
function renderVideo() {
  const slot = $("#videoSlot");
  if (!slot) return;
  const url = (CONFIG.video.url || "").trim();
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w\-]{6,})/);
  if (m) {
    slot.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + m[1] +
      '" title="' + CONFIG.video.title + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  } else if (url) {
    slot.innerHTML =
      '<iframe src="' + url + '" title="' + CONFIG.video.title +
      '" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  } else {
    slot.innerHTML =
      '<div class="video-placeholder">' +
        '<span class="vp-icon" aria-hidden="true">&#9654;</span>' +
        '<p class="vp-title">VIDEO KAMI SEGERA HADIR</p>' +
        '<p class="vp-sub">Momen indah kami akan segera hadir di sini</p>' +
      "</div>";
  }
}

/* Hadiah */
function renderGifts() {
  const bankWrap = $("#bankList");
  if (bankWrap) {
    bankWrap.innerHTML = CONFIG.gifts.banks.map((bk) =>
      '<div class="bank-row">' +
        '<span class="bank-name">' + bk.name + "</span>" +
        '<span class="bank-info"><span class="bank-no">' + bk.number + '</span>' +
        '<span class="bank-holder">' + bk.holder + "</span></span>" +
        '<button type="button" class="btn-copy" data-copy="' + bk.number + '">SALIN</button>' +
      "</div>"
    ).join("");
  }
  const walletWrap = $("#walletList");
  if (walletWrap) {
    walletWrap.innerHTML = CONFIG.gifts.wallets.map((w) =>
      '<button type="button" class="wallet-chip" data-copy="' + w.number + '">' +
        '<span class="w-label">' + w.name + "</span>" + w.number +
      "</button>"
    ).join("");
  }
}

/* ============================================================
   AMPLOP — BUKA UNDANGAN
   ============================================================ */
const cover = $("#cover");
const btnOpen = $("#btnOpen");

function openInvitation() {
  if (!cover || cover.classList.contains("opening")) return;
  cover.classList.add("opening"); /* flap terbuka, surat keluar */

  const t2 = reduceMotion ? 350 : 1350; /* cover mulai menghilang */
  const t3 = reduceMotion ? 800 : 2150; /* hapus cover dari DOM */

  setTimeout(() => {
    cover.classList.add("fade");
    document.body.classList.remove("locked");
    document.body.classList.add("entered");
    $("#content").setAttribute("aria-hidden", "false");
    $("#musicBtn").hidden = false;
    $("#floatNav").hidden = false;
    playMusic();
    startPetals();
  }, t2);

  setTimeout(() => cover.remove(), t3);
}

if (btnOpen) btnOpen.addEventListener("click", openInvitation);
document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && cover && !cover.classList.contains("fade")) {
    openInvitation();
  }
});

/* Partikel cahaya di cover */
(function startCoverParticles() {
  if (reduceMotion) return;
  const wrap = $("#coverParticles");
  if (!wrap) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("span");
    p.className = "cover-particle";
    const s = 2 + Math.random() * 3.5;
    p.style.width = s + "px";
    p.style.height = s + "px";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 8 + Math.random() * 9 + "s";
    p.style.animationDelay = Math.random() * 8 + "s";
    p.style.opacity = (0.35 + Math.random() * 0.5).toFixed(2);
    wrap.appendChild(p);
  }
})();

/* ============================================================
   COUNTDOWN
   ============================================================ */
function setupCountdown() {
  const weddingTime = new Date(CONFIG.wedding.date).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  const el = (id) => $("#" + id);

  function tick() {
    const diff = weddingTime - Date.now();
    if (diff <= 0) {
      el("cdDays").textContent = "00";
      el("cdHours").textContent = "00";
      el("cdMins").textContent = "00";
      el("cdSecs").textContent = "00";
      return;
    }
    el("cdDays").textContent = pad(Math.floor(diff / 86400000));
    el("cdHours").textContent = pad(Math.floor((diff % 86400000) / 3600000));
    el("cdMins").textContent = pad(Math.floor((diff % 3600000) / 60000));
    el("cdSecs").textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   ANIMASI SAAT SCROLL (IntersectionObserver)
   ============================================================ */
function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("revealed");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  $$(".reveal, .reveal-left, .reveal-right, .reveal-zoom").forEach((el) => io.observe(el));
}

/* ============================================================
   LIGHTBOX GALERI
   ============================================================ */
function setupLightbox() {
  const lb = $("#lightbox");
  if (!lb) return;
  const img = $("#lbImg");
  const cap = $("#lbCaption");
  const counter = $("#lbCounter");
  let index = 0;
  let startX = 0;

  function render() {
    const item = galleryItems[index];
    img.src = item.src;
    img.alt = item.caption;
    cap.textContent = item.caption;
    counter.textContent = (index + 1) + " / " + galleryItems.length;
  }

  function open(i) {
    if (!galleryItems.length) return;
    index = (i + galleryItems.length) % galleryItems.length;
    render();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  const next = () => open(index + 1);
  const prev = () => open(index - 1);

  /* klik / keyboard pada item galeri */
  $("#galleryGrid").addEventListener("click", (e) => {
    const item = e.target.closest(".g-item");
    if (item) open(parseInt(item.dataset.index, 10));
  });
  $("#galleryGrid").addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const item = e.target.closest(".g-item");
    if (item) { e.preventDefault(); open(parseInt(item.dataset.index, 10)); }
  });

  $(".lb-close").addEventListener("click", close);
  $(".lb-prev").addEventListener("click", prev);
  $(".lb-next").addEventListener("click", next);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });

  /* swipe untuk HP */
  lb.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 44) (dx < 0 ? next : prev)();
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });
}

/* ============================================================
   RSVP → Firestore (collection: rsvps)
   ============================================================ */
function setupRsvp() {
  const form = $("#rsvpForm");
  if (!form) return;
  const btn = $("#rsvpSubmit");
  const status = $("#rsvpStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "rsvp-status";
    status.textContent = "";

    const name = $("#rsvpName").value.trim();
    const attendance = form.querySelector('input[name="attendance"]:checked');
    const guests = parseInt($("#rsvpGuests").value, 10) || 1;
    const message = $("#rsvpMsg").value.trim();

    if (!name) { status.textContent = "Mohon isi nama Anda terlebih dahulu."; status.classList.add("error"); return; }
    if (!attendance) { status.textContent = "Mohon pilih status kehadiran."; status.classList.add("error"); return; }

    if (!db) {
      status.textContent = "Koneksi ke database sedang bermasalah. Mohon coba beberapa saat lagi.";
      status.classList.add("error");
      toast("Koneksi sedang bermasalah");
      return;
    }

    btn.classList.add("loading");
    btn.disabled = true;

    try {
      await db.collection("rsvps").add({
        name: name,
        attendance: attendance.value,
        guests: guests,
        message: message || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      form.reset();
      status.textContent = "Terima kasih! Konfirmasi Anda telah kami terima.";
      status.classList.add("ok");
      toast("Konfirmasi terkirim \u2713");
    } catch (err) {
      console.warn("RSVP gagal:", err);
      status.textContent = "Koneksi ke database sedang bermasalah. Mohon coba beberapa saat lagi.";
      status.classList.add("error");
      toast("Koneksi sedang bermasalah");
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  });
}

/* ============================================================
   BUKU TAMU — realtime listener Firestore
   ============================================================ */
function formatTime(t) {
  let d;
  try {
    d = t && typeof t.toDate === "function" ? t.toDate()
      : t instanceof Date ? t
      : t && t.seconds ? new Date(t.seconds * 1000)
      : new Date();
  } catch (err) { d = new Date(); }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function renderGuestbook(list) {
  const grid = $("#guestbookGrid");
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<p class="gb-empty" style="text-align:center;color:var(--ink-soft);grid-column:1/-1;">Belum ada ucapan. Jadilah yang pertama mengirim doa \u2665</p>';
    return;
  }
  /* Semua isi kartu diisi lewat textContent agar aman dari XSS */
  grid.innerHTML = list.map((_, i) =>
    '<article class="gb-card" data-i="' + i + '">' +
      '<div class="gb-head"><span class="gb-name"></span><span class="gb-badge"></span></div>' +
      '<div class="gb-meta"><span class="gb-count"></span><span class="gb-date"></span></div>' +
      '<p class="gb-msg"></p>' +
    "</article>"
  ).join("");
  grid.querySelectorAll(".gb-card").forEach((card, i) => {
    const g = list[i];
    if (!g) return;
    card.querySelector(".gb-name").textContent = g.name || "Tamu";
    const badge = card.querySelector(".gb-badge");
    badge.textContent = g.attendance || "-";
    badge.classList.toggle("hadir", g.attendance === "Hadir");
    badge.classList.toggle("tidak", g.attendance !== "Hadir");
    card.querySelector(".gb-count").textContent = (g.guests || 1) + " orang";
    card.querySelector(".gb-date").textContent = formatTime(g.createdAt);
    const msg = card.querySelector(".gb-msg");
    if (g.message) {
      msg.textContent = '"' + g.message + '"';
    } else {
      msg.remove();
    }
  });
}

function setupGuestbook() {
  const notice = $("#gbNotice");
  if (!db) {
    notice.hidden = false;
    notice.textContent = "Koneksi ke database sedang bermasalah. Ucapan di bawah adalah contoh.";
    renderGuestbook([
      { name: "Budi Santoso", attendance: "Hadir", guests: 2, message: "Selamat menempuh hidup baru, semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.", createdAt: null },
      { name: "Ibu Ratna", attendance: "Masih Ragu", guests: 1, message: "Barakallahu lakuma, semoga langgeng selalu!", createdAt: null }
    ]);
    return;
  }
  db.collection("rsvps")
    .orderBy("createdAt", "desc")
    .limit(30)
    .onSnapshot(
      (snap) => {
        notice.hidden = true;
        renderGuestbook(snap.docs.map((d) => d.data()));
      },
      (err) => {
        console.warn("Gagal memuat buku tamu:", err);
        notice.hidden = false;
        notice.textContent = "Koneksi ke database sedang bermasalah. Ucapan akan tampil saat koneksi pulih.";
      }
    );
}

/* ============================================================
   MUSIK LATAR
   ============================================================ */
let audioEl = null;
let musicTried = false;

function playMusic() {
  if (!CONFIG.music) return;
  if (!audioEl) audioEl = new Audio(CONFIG.music);
  audioEl.loop = true;
  audioEl.volume = 0.55;

  const p = audioEl.play();
  if (p && p.then) {
    p.then(() => setPlaying(true))
     .catch(() => {
       setPlaying(false);
       if (!musicTried) { toast("Musik belum tersedia"); musicTried = true; }
     });
  }
}

function setPlaying(on) {
  const btn = $("#musicBtn");
  if (!btn) return;
  btn.classList.toggle("playing", on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.setAttribute("aria-label", on ? "Hentikan musik" : "Putar musik");
}

function setupMusic() {
  const btn = $("#musicBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!audioEl) audioEl = new Audio(CONFIG.music);
    if (audioEl.paused) {
      audioEl.loop = true;
      audioEl.volume = 0.55;
      const p = audioEl.play();
      if (p && p.then) p.then(() => setPlaying(true)).catch(() => { toast("Musik belum tersedia"); setPlaying(false); });
    } else {
      audioEl.pause();
      setPlaying(false);
    }
  });
}

/* ============================================================
   NAVIGASI MELAYANG — scroll spy + smooth navigation
   ============================================================ */
function setupNav() {
  const links = $$(".nav-item");

  const sections = links
    .map((l) => document.getElementById(l.dataset.target))
    .filter(Boolean);

  if (!sections.length) return;

  // Klik navbar → scroll tanpa reload
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.dataset.target;
      const target = document.getElementById(targetId);

      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      // Jangan ubah /@username
      // Hanya memperbarui hash tanpa reload
      history.replaceState(null, "", "#" + targetId);
    });
  });

  // Scroll spy
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((l) => {
          l.classList.toggle(
            "active",
            l.dataset.target === en.target.id
          );
        });
      }
    });
  }, {
    rootMargin: "-42% 0px -52% 0px",
    threshold: 0
  });

  sections.forEach((s) => spy.observe(s));
}
/* ============================================================
   SALIN TEKS (nomor rekening, e-wallet, alamat)
   ============================================================ */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) { /* lanjut ke fallback */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (err) {
    return false;
  }
}

function setupCopy() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    copyText(btn.dataset.copy).then((ok) => toast(ok ? "Tersalin ke clipboard \u2713" : "Gagal menyalin teks"));
  });
}

/* ============================================================
   KELOPAK BUNGA JATUH
   ============================================================ */
function startPetals() {
  if (reduceMotion) return;
  const wrap = $("#petals");
  if (!wrap || wrap.dataset.started) return;
  wrap.dataset.started = "1";
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    const s = 7 + Math.random() * 9;
    p.style.width = s + "px";
    p.style.height = s * 1.3 + "px";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 9 + Math.random() * 9 + "s";
    p.style.animationDelay = Math.random() * 8 + "s";
    p.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
    wrap.appendChild(p);
  }
}

/* ============================================================
   PARALLAX + EFEK 3D
   ============================================================ */
function setupParallax() {
  const heroBg = $(".hero-bg");
  const photos = $$(".tl-photo");
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  if (!heroBg && !photos.length) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (heroBg && isDesktop && !reduceMotion) {
        heroBg.style.transform = "translateY(" + y * 0.22 + "px)";
      }
      if (photos.length && !reduceMotion) {
        const mid = window.innerHeight / 2;
        photos.forEach((ph) => {
          const r = ph.getBoundingClientRect();
          const off = (r.top + r.height / 2 - mid) * -0.045;
          ph.style.transform = "translateY(" + off.toFixed(1) + "px)";
        });
      }
      ticking = false;
    });
  }, { passive: true });
}

function setupTilt() {
  if (reduceMotion) return;
  if (!window.matchMedia("(hover: hover) and (min-width: 900px)").matches) return;
  $$(".couple-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

/* Kupu-kupu di hero */
function setupButterflies() {
  if (reduceMotion) return;
  const hero = $(".hero");
  if (!hero) return;
  const b1 = document.createElement("span");
  b1.className = "bfly b1";
  const b2 = document.createElement("span");
  b2.className = "bfly b2";
  hero.appendChild(b1);
  hero.appendChild(b2);
}

/* ============================================================
   INIT
   ============================================================ */
(async function init() {
  await loadConfigFromFirebase();
  await loadGuest();
  applyStatic();
  setGuestNames();
  renderStory();
  renderGallery();
  renderGifts();
  renderVideo();
  setupCountdown();
  setupReveal();
  setupLightbox();
  setupRsvp();
  setupGuestbook();
  setupMusic();
  setupNav();
  setupCopy();
  setupParallax();
  setupTilt();
  setupButterflies();
})();

