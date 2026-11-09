/* ui.js — helper UI bersama: format, ikon, SVG iPhone, navbar, footer, modal, toast, guard */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rp = n => 'Rp' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = t => new Date(t).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const stars = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

const SVGATTR = 'width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  user: `<svg ${SVGATTR}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>`,
  bag: `<svg ${SVGATTR}><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>`,
  search: `<svg ${SVGATTR} width="18" height="18"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`
};

/* ---------- Toast ---------- */
function toast(msg, type = 'ok') {
  let w = $('#toasts');
  if (!w) { w = document.createElement('div'); w.id = 'toasts'; document.body.appendChild(w); }
  const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg; w.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
}

/* ---------- Modal ---------- */
function openModal({ title, body, saveLabel = 'Simpan', onSave, wide = false }) {
  const el = document.createElement('div'); el.className = 'modal-backdrop';
  el.innerHTML = `<div class="modal ${wide ? 'wide' : ''}"><div class="modal-head"><h3>${esc(title)}</h3><button type="button" class="x" aria-label="Tutup">×</button></div>
  <form class="modal-body">${body}<div class="modal-foot"><button type="button" class="btn ghost cancel">${onSave ? 'Batal' : 'Tutup'}</button>${onSave ? `<button class="btn dark">${esc(saveLabel)}</button>` : ''}</div></form></div>`;
  document.body.appendChild(el);
  const close = () => el.remove();
  $('.x', el).onclick = close; $('.cancel', el).onclick = close;
  el.addEventListener('mousedown', e => { if (e.target === el) close(); });
  $('form', el).addEventListener('submit', async e => {
    e.preventDefault();
    if (!onSave) return close();
    try { const r = await onSave(new FormData(e.target), e.target); if (r !== false) close(); }
    catch (err) { toast(err.message, 'err'); }
  });
  return { el, close };
}

/* ---------- Guard ---------- */
function requireLogin() {
  const u = API.currentUser();
  if (!u) { location.replace('/login?redirect=' + encodeURIComponent(location.pathname + location.search)); return null; }
  return u;
}
function requireAdmin() {
  const u = API.currentUser();
  if (!u || u.role !== 'admin') { location.replace('/login'); return null; }
  return u;
}

/* ---------- Gambar ---------- */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, v));
  return '#' + [c((n >> 16) + amt), c(((n >> 8) & 255) + amt), c((n & 255) + amt)].map(v => v.toString(16).padStart(2, '0')).join('');
}
let _svgN = 0;
function phoneSVG(color = '#444444', view = 'back') {
  const id = 'g' + (++_svgN), d = shade(color, -35), l = shade(color, 24);
  const lens = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b1b1d" stroke="#6b6b70" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r * .55}" fill="#0b0b0c"/><circle cx="${cx - r * .2}" cy="${cy - r * .2}" r="${r * .14}" fill="#5b6b8a" opacity=".8"/>`;
  if (view === 'front') return `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tampak depan"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".55" stop-color="#7c3aed"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><rect x="8" y="8" width="184" height="384" rx="36" fill="${d}"/><rect x="14" y="14" width="172" height="372" rx="31" fill="#0a0a0a"/><rect x="19" y="19" width="162" height="362" rx="27" fill="url(#${id})"/><rect x="74" y="28" width="52" height="15" rx="8" fill="#000"/><text x="100" y="205" text-anchor="middle" font-family="Arial" font-size="42" fill="#fff" opacity=".92">9:41</text></svg>`;
  if (view === 'camera') return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kamera"><defs><radialGradient id="${id}"><stop offset="0" stop-color="#3a3a42"/><stop offset="1" stop-color="#050505"/></radialGradient></defs><rect width="300" height="300" fill="#0d0d0f"/><circle cx="150" cy="150" r="108" fill="url(#${id})" stroke="#55555c" stroke-width="5"/><circle cx="150" cy="150" r="70" fill="#09090b" stroke="#2e2e34" stroke-width="4"/><circle cx="150" cy="150" r="34" fill="#101626"/><circle cx="132" cy="132" r="9" fill="#6f84b3" opacity=".7"/></svg>`;
  return `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tampak belakang"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs><rect x="6" y="6" width="188" height="388" rx="38" fill="${d}"/><rect x="10" y="10" width="180" height="380" rx="34" fill="url(#${id})"/><rect x="24" y="24" width="98" height="98" rx="26" fill="${shade(color, 8)}" stroke="${d}" stroke-width="2"/>${lens(52, 52, 19)}${lens(52, 96, 19)}${lens(98, 74, 19)}<circle cx="142" cy="40" r="6" fill="#f3e4a8"/><circle cx="142" cy="62" r="4" fill="#222"/><circle cx="100" cy="250" r="15" fill="${l}" opacity=".55"/></svg>`;
}

/* ---------- Header / Footer (customer) ---------- */
function updateCartBadge() {
  const b = $('#cartCount'); if (!b) return;
  const n = API.cart.count(); b.textContent = n; b.classList.toggle('hidden', n === 0);
}
function renderHeader() {
  const h = $('#site-header'); if (!h) return;
  const page = document.body.dataset.page, u = API.currentUser();
  if (page === 'login' || page === 'register') {
    h.innerHTML = `<nav class="nav simple"><a class="brand" href="/">ambaSTORE<sup>2026</sup></a><div class="nav-icons"><a class="icon-btn" href="/login" aria-label="Akun">${ICON.user}</a><a class="icon-btn" href="/cart" aria-label="Keranjang">${ICON.bag}<span class="badge-count hidden" id="cartCount">0</span></a></div></nav>`;
    updateCartBadge(); return;
  }
  const L = (href, label, key) => `<li><a href="${href}" class="${page === key ? 'active' : ''}">${label}</a></li>`;
  const acct = u
    ? `<div class="dropdown"><button class="icon-btn" id="acctBtn" aria-label="Akun">${ICON.user}</button><div class="menu hidden" id="acctMenu"><div class="menu-head"><strong>${esc(u.name)}</strong><span>${esc(u.email)}</span></div><a href="/profile">Profil Saya</a><a href="/orders">Pesanan Saya</a>${u.role === 'admin' ? '<a href="/admin">Panel Admin</a>' : ''}<button id="logoutBtn">Keluar</button></div></div>`
    : `<a class="icon-btn" href="/login" aria-label="Masuk">${ICON.user}</a>`;
  h.innerHTML = `<div class="announce">Gratis ongkir seluruh Indonesia · Garansi resmi 1 tahun · Cicilan 0% hingga 24 bulan</div>
  <nav class="nav container"><button class="burger" id="burger" aria-label="Menu">☰</button>
  <a class="brand" href="/">ambaSTORE<sup>2026</sup></a>
  <ul class="nav-links" id="navlinks">${L('/', 'Beranda', 'home')}${L('/?series=17#produk', 'iPhone 17')}${L('/?series=16#produk', 'iPhone 16')}${L('/?series=15#produk', 'iPhone 15')}${L('/orders', 'Pesanan Saya', 'orders')}</ul>
  <form class="nav-search" id="navsearch">${ICON.search}<input name="q" placeholder="Cari iPhone, warna…" autocomplete="off"></form>
  <div class="nav-icons">${acct}<a class="icon-btn" href="/cart" aria-label="Keranjang">${ICON.bag}<span class="badge-count hidden" id="cartCount">0</span></a></div></nav>`;
  $('#burger').onclick = () => $('#navlinks').classList.toggle('open');
  $('#navsearch').onsubmit = e => { e.preventDefault(); location.href = '/?q=' + encodeURIComponent(e.target.q.value.trim()) + '#produk'; };
  const ab = $('#acctBtn');
  if (ab) {
    ab.onclick = e => { e.stopPropagation(); $('#acctMenu').classList.toggle('hidden'); };
    document.addEventListener('click', () => $('#acctMenu') && $('#acctMenu').classList.add('hidden'));
    $('#logoutBtn').onclick = () => { API.logout(); location.href = '/'; };
  }
  updateCartBadge();
}
function renderFooter() {
  const f = $('#site-footer'); if (!f) return;
  f.innerHTML = `<div class="container foot-grid"><div><div class="brand">ambaSTORE<sup>2026</sup></div><p class="muted">Toko iPhone Pro &amp; Pro Max resmi. Proyek tugas e-commerce.</p></div>
  <div><h4>Belanja</h4><a href="/?series=17#produk">iPhone 17</a><a href="/?series=16#produk">iPhone 16</a><a href="/?series=15#produk">iPhone 15</a></div>
  <div><h4>Akun</h4><a href="/login">Masuk / Daftar</a><a href="/orders">Pesanan Saya</a><a href="/cart">Keranjang</a></div>
  <div><h4>Bantuan</h4><span>Cara pembayaran: transfer bank</span><span>Konfirmasi: upload bukti transfer</span></div></div>
  <div class="container copy">© 2026 ambaSTORE. Seluruh data pada halaman ini hanya untuk demo.</div>`;
}

/* ---------- Admin shell ---------- */
async function initAdmin(active, title) {
  const u = requireAdmin(); if (!u) return false;
  const items = [['dashboard', 'Dashboard'], ['products', 'Katalog Produk'], ['users', 'Akun Pengguna'], ['transactions', 'Laporan Transaksi'], ['payments', 'Approval Bayar']];
  const pending = (await API.orders.listAll()).filter(o => o.status === 'awaiting_verification').length;
  $('#admin-side').innerHTML = `<a class="brand" href="/admin">ambaSTORE<sup>ADMIN</sup></a><nav>${items.map(([k, l]) => `<a href="${k === 'dashboard' ? '/admin' : '/admin/' + k}" class="${k === active ? 'active' : ''}">${l}${k === 'payments' && pending ? `<span class="pill">${pending}</span>` : ''}</a>`).join('')}</nav><div class="side-foot"><a href="/">← Lihat Toko</a><button id="admLogout">Keluar</button></div>`;
  $('#admin-top').innerHTML = `<h1>${esc(title)}</h1><div class="who"><span>${esc(u.name)}</span><small>Admin</small></div>`;
  $('#admLogout').onclick = () => { API.logout(); location.href = '/login'; };
  return true;
}

/* ---------- Util ---------- */
function fileToDataURL(file, max = 900) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => rej(new Error('File bukan gambar yang valid')); img.src = r.result;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
function statusBadge(s) { const m = ORDER_STATUS[s] || { label: s, cls: '' }; return `<span class="badge ${m.cls}">${m.label}</span>`; }
function itemLabel(i) { return `${esc(i.name)} ${esc(i.model)} · ${esc(i.color)} · ${i.ram} GB RAM · ${esc(i.storage)}`; }

renderHeader();
renderFooter();
