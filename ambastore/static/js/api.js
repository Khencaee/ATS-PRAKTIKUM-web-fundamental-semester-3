/* =====================================================================
 * api.js — DATA LAYER (sementara: localStorage)
 * Semua halaman hanya memanggil objek API di bawah ini. Saat backend
 * sudah siap, cukup ganti isi tiap fungsi dengan fetch() ke web server
 * kamu (semua fungsi sudah async, kecuali currentUser & cart).
 * CATATAN: password plaintext di sini HANYA untuk demo. Di backend wajib di-hash.
 * ===================================================================== */
const DB_KEY = 'ambastore_db_v1';
const SESSION_KEY = 'ambastore_session_v1';
const CART_KEY = 'ambastore_cart_v1';

const OPTIONS = {
  models: ['Pro', 'Pro Max'],
  ram: [
    { value: 8, add: 0 },
    { value: 16, add: 2500000 },
    { value: 32, add: 6000000 }
  ],
  storage: [
    { value: '256 GB', add: 0 },
    { value: '512 GB', add: 3000000 },
    { value: '1 TB', add: 7000000 }
  ]
};

const ORDER_STATUS = {
  awaiting_payment: { label: 'Menunggu Pembayaran', cls: 'warn' },
  awaiting_verification: { label: 'Menunggu Verifikasi', cls: 'info' },
  paid: { label: 'Pembayaran Disetujui', cls: 'ok' },
  rejected: { label: 'Pembayaran Ditolak', cls: 'danger' }
};

const BANKS = [
  { bank: 'BCA', no: '1234 5678 90', name: 'PT ambaSTORE Indonesia' },
  { bank: 'Mandiri', no: '1300 0123 4567', name: 'PT ambaSTORE Indonesia' },
  { bank: 'BNI', no: '0123 4567 89', name: 'PT ambaSTORE Indonesia' }
];

function calcPrice(p, model, ram, storage) {
  const r = (OPTIONS.ram.find(x => x.value == ram) || {}).add || 0;
  const s = (OPTIONS.storage.find(x => x.value === storage) || {}).add || 0;
  return ((p.basePrice || {})[model] || 0) + r + s;
}

function proofPlaceholder() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="480"><rect width="360" height="480" fill="#f3f4f6"/><text x="180" y="230" text-anchor="middle" font-family="Arial" font-size="20" fill="#374151">BUKTI TRANSFER</text><text x="180" y="262" text-anchor="middle" font-family="Arial" font-size="14" fill="#6b7280">(contoh data demo)</text></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function seedDB() {
  const now = Date.now(), day = 86400000;
  const products = [
    { id: 1, series: 17, name: 'iPhone 17', tag: 'NEW', tagline: 'Jauh lebih Pro.',
      desc: 'Chip generasi terbaru, kamera utama Fusion 48 MP dengan aperture variabel, layar ProMotion dan bodi yang lebih ringan.',
      basePrice: { 'Pro': 21999000, 'Pro Max': 24999000 },
      colors: [{ name: 'Cosmic Orange', hex: '#d9783a' }, { name: 'Deep Blue', hex: '#2e4a78' }, { name: 'Silver', hex: '#e3e4e6' }, { name: 'Space Black', hex: '#2b2b2d' }],
      stock: 25, active: true },
    { id: 2, series: 16, name: 'iPhone 16', tag: '', tagline: 'Dibuat untuk Apple Intelligence.',
      desc: 'Tombol Camera Control, chip A18 Pro, baterai tahan seharian, dan sistem kamera Pro yang canggih.',
      basePrice: { 'Pro': 17999000, 'Pro Max': 20999000 },
      colors: [{ name: 'Desert Titanium', hex: '#bfa48f' }, { name: 'Natural Titanium', hex: '#a8a49b' }, { name: 'White Titanium', hex: '#e9e7e2' }, { name: 'Black Titanium', hex: '#3a3a3c' }],
      stock: 18, active: true },
    { id: 3, series: 15, name: 'iPhone 15', tag: '', tagline: 'Titanium. Tangguh. Ringan.',
      desc: 'Bodi titanium kelas aerospace, USB-C, chip A17 Pro, dan kamera telefoto 5x pada varian Pro Max.',
      basePrice: { 'Pro': 14999000, 'Pro Max': 17999000 },
      colors: [{ name: 'Blue Titanium', hex: '#3b4a5c' }, { name: 'Natural Titanium', hex: '#b5ada2' }, { name: 'White Titanium', hex: '#e8e6e1' }, { name: 'Black Titanium', hex: '#2f3033' }],
      stock: 12, active: true }
  ];
  const users = [
    { id: 1, name: 'Administrator', email: 'admin@ambastore.com', password: 'admin123', phone: '081200000001', address: '', role: 'admin', active: true, createdAt: now - 30 * day },
    { id: 2, name: 'Budi Santoso', email: 'demo@ambastore.com', password: 'user123', phone: '081234567890', address: 'Jl. Contoh No. 10, Jakarta Selatan', role: 'customer', active: true, createdAt: now - 12 * day },
    { id: 3, name: 'Siti Rahma', email: 'siti@example.com', password: 'user123', phone: '081298765432', address: 'Jl. Melati No. 5, Bandung', role: 'customer', active: true, createdAt: now - 5 * day }
  ];
  const reviews = [
    { id: 1, productId: 1, userId: 2, userName: 'Budi Santoso', rating: 5, text: 'Kamera luar biasa, baterai awet seharian.', date: now - 3 * day },
    { id: 2, productId: 1, userId: 3, userName: 'Siti Rahma', rating: 4, text: 'Bagus, pengiriman cepat. Warna orangenya cantik.', date: now - 2 * day },
    { id: 3, productId: 2, userId: 2, userName: 'Budi Santoso', rating: 5, text: 'Performa kencang, Camera Control sangat berguna.', date: now - 6 * day }
  ];
  const orders = [
    { id: 'ORD-DEMO001', userId: 2, userName: 'Budi Santoso', receiver: 'Budi Santoso', phone: '081234567890', address: 'Jl. Contoh No. 10, Jakarta Selatan',
      items: [{ productId: 2, name: 'iPhone 16', model: 'Pro', color: 'Desert Titanium', colorHex: '#bfa48f', ram: 8, storage: '256 GB', qty: 1, price: 17999000 }],
      total: 17999000, bank: 'BCA', proof: proofPlaceholder(), status: 'paid', note: '', createdAt: now - 6 * day },
    { id: 'ORD-DEMO002', userId: 3, userName: 'Siti Rahma', receiver: 'Siti Rahma', phone: '081298765432', address: 'Jl. Melati No. 5, Bandung',
      items: [{ productId: 1, name: 'iPhone 17', model: 'Pro Max', color: 'Deep Blue', colorHex: '#2e4a78', ram: 16, storage: '512 GB', qty: 1, price: 30499000 }],
      total: 30499000, bank: 'Mandiri', proof: proofPlaceholder(), status: 'awaiting_verification', note: '', createdAt: now - 1 * day }
  ];
  return { products, users, reviews, orders, seq: { product: 4, user: 4, review: 4 } };
}

function readDB() {
  let raw = localStorage.getItem(DB_KEY);
  if (!raw) { const s = seedDB(); localStorage.setItem(DB_KEY, JSON.stringify(s)); return s; }
  return JSON.parse(raw);
}
function writeDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
const delay = v => Promise.resolve(v);

const API = {
  /* ---------- AUTH ---------- */
  currentUser() {
    const id = Number(localStorage.getItem(SESSION_KEY));
    if (!id) return null;
    const u = readDB().users.find(x => x.id === id);
    return u && u.active ? u : null;
  },
  async register({ name, email, phone, password }) {
    const db = readDB();
    email = email.trim().toLowerCase();
    if (db.users.some(u => u.email === email)) throw new Error('Email sudah terdaftar');
    const u = { id: db.seq.user++, name: name.trim(), email, phone: phone || '', address: '', password, role: 'customer', active: true, createdAt: Date.now() };
    db.users.push(u); writeDB(db);
    localStorage.setItem(SESSION_KEY, u.id);
    return u;
  },
  async login(email, password) {
    const u = readDB().users.find(x => x.email === email.trim().toLowerCase() && x.password === password);
    if (!u) throw new Error('Email atau password salah');
    if (!u.active) throw new Error('Akun Anda dinonaktifkan. Hubungi admin.');
    localStorage.setItem(SESSION_KEY, u.id);
    return u;
  },
  logout() { localStorage.removeItem(SESSION_KEY); },
  async updateProfile(id, data) {
    const db = readDB(); const u = db.users.find(x => x.id === id);
    if (!u) throw new Error('User tidak ditemukan');
    Object.assign(u, data); writeDB(db); return u;
  },
  async changePassword(id, oldPw, newPw) {
    const db = readDB(); const u = db.users.find(x => x.id === id);
    if (!u || u.password !== oldPw) throw new Error('Password lama salah');
    u.password = newPw; writeDB(db); return true;
  },

  /* ---------- PRODUK ---------- */
  products: {
    async list({ all = false } = {}) {
      const l = readDB().products;
      return delay(all ? l : l.filter(p => p.active));
    },
    async get(id) { return delay(readDB().products.find(p => p.id === Number(id)) || null); },
    async save(p) {
      const db = readDB();
      if (p.id) { const i = db.products.findIndex(x => x.id === p.id); db.products[i] = { ...db.products[i], ...p }; }
      else { p.id = db.seq.product++; db.products.push(p); }
      writeDB(db); return p;
    },
    async remove(id) {
      const db = readDB(); db.products = db.products.filter(p => p.id !== id);
      db.reviews = db.reviews.filter(r => r.productId !== id); writeDB(db);
    }
  },

  /* ---------- REVIEW ---------- */
  reviews: {
    async list(productId) {
      const l = readDB().reviews;
      return delay((productId ? l.filter(r => r.productId === Number(productId)) : l).slice().sort((a, b) => b.date - a.date));
    },
    async add({ productId, rating, text }) {
      const u = API.currentUser(); if (!u) throw new Error('Silakan login dulu');
      const db = readDB();
      db.reviews.push({ id: db.seq.review++, productId, userId: u.id, userName: u.name, rating: Number(rating), text, date: Date.now() });
      writeDB(db);
    }
  },

  /* ---------- KERANJANG (client side) ---------- */
  cart: {
    get() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } },
    save(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); },
    add(it) {
      const c = this.get();
      const key = [it.productId, it.model, it.color, it.ram, it.storage].join('|');
      const ex = c.find(x => x.key === key);
      if (ex) ex.qty += it.qty; else c.push({ ...it, key });
      this.save(c);
    },
    setQty(key, q) { const c = this.get(); const it = c.find(x => x.key === key); if (it) it.qty = Math.max(1, q); this.save(c); },
    remove(key) { this.save(this.get().filter(x => x.key !== key)); },
    clear() { this.save([]); },
    count() { return this.get().reduce((a, b) => a + b.qty, 0); }
  },

  /* ---------- PESANAN ---------- */
  orders: {
    async create({ receiver, phone, address, bank }) {
      const u = API.currentUser(); if (!u) throw new Error('Silakan login dulu');
      const cart = API.cart.get(); if (!cart.length) throw new Error('Keranjang kosong');
      const db = readDB(); const items = [];
      for (const c of cart) {
        const p = db.products.find(x => x.id === c.productId);
        if (!p || !p.active) throw new Error(c.name + ' sudah tidak tersedia');
        if (p.stock < c.qty) throw new Error('Stok ' + p.name + ' tidak cukup (sisa ' + p.stock + ')');
        items.push({ productId: p.id, name: p.name, model: c.model, color: c.color, colorHex: c.colorHex, ram: c.ram, storage: c.storage, qty: c.qty, price: calcPrice(p, c.model, c.ram, c.storage) });
      }
      items.forEach(i => { db.products.find(p => p.id === i.productId).stock -= i.qty; });
      const order = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(), userId: u.id, userName: u.name,
        receiver, phone, address, items, total: items.reduce((a, i) => a + i.price * i.qty, 0),
        bank, proof: null, status: 'awaiting_payment', note: '', createdAt: Date.now()
      };
      db.orders.push(order); writeDB(db); API.cart.clear(); return order;
    },
    async listMine() {
      const u = API.currentUser();
      return delay(readDB().orders.filter(o => u && o.userId === u.id).sort((a, b) => b.createdAt - a.createdAt));
    },
    async listAll() { return delay(readDB().orders.slice().sort((a, b) => b.createdAt - a.createdAt)); },
    async uploadProof(id, dataUrl) {
      const db = readDB(); const o = db.orders.find(x => x.id === id);
      if (!o) throw new Error('Pesanan tidak ditemukan');
      o.proof = dataUrl; o.status = 'awaiting_verification'; o.note = ''; writeDB(db);
    },
    async review(id, approve, note = '') {
      const db = readDB(); const o = db.orders.find(x => x.id === id);
      if (!o) throw new Error('Pesanan tidak ditemukan');
      if (approve) { o.status = 'paid'; o.note = ''; }
      else {
        if (o.status !== 'rejected') o.items.forEach(i => { const p = db.products.find(x => x.id === i.productId); if (p) p.stock += i.qty; });
        o.status = 'rejected'; o.note = note;
      }
      writeDB(db);
    }
  },

  /* ---------- USER (admin) ---------- */
  users: {
    async list() { return delay(readDB().users); },
    async save(u) {
      const db = readDB();
      if (db.users.some(x => x.email === u.email && x.id !== u.id)) throw new Error('Email sudah dipakai');
      if (u.id) { const i = db.users.findIndex(x => x.id === u.id); db.users[i] = { ...db.users[i], ...u }; }
      else { u.id = db.seq.user++; u.createdAt = Date.now(); db.users.push(u); }
      writeDB(db); return u;
    },
    async remove(id) { const db = readDB(); db.users = db.users.filter(u => u.id !== id); writeDB(db); }
  },

  resetDemo() { localStorage.removeItem(DB_KEY); localStorage.removeItem(CART_KEY); localStorage.removeItem(SESSION_KEY); }
};
