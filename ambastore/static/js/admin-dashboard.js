(async () => {
  if (!(await initAdmin('dashboard', 'Dashboard'))) return;
  const [products, users, orders] = await Promise.all([API.products.list({ all: true }), API.users.list(), API.orders.listAll()]);
  const revenue = orders.filter(o => o.status === 'paid').reduce((a, o) => a + o.total, 0);
  const pending = orders.filter(o => o.status === 'awaiting_verification').length;
  $('#content').innerHTML = `
  <div class="stats">
    <div class="stat"><small>Pendapatan (disetujui)</small><b>${rp(revenue)}</b></div>
    <div class="stat"><small>Total pesanan</small><b>${orders.length}</b></div>
    <div class="stat"><small>Menunggu verifikasi</small><b>${pending}</b></div>
    <div class="stat"><small>Produk aktif</small><b>${products.filter(p => p.active).length}</b></div>
    <div class="stat"><small>Pengguna</small><b>${users.length}</b></div>
  </div>
  <div class="panel"><h2>Pesanan Terbaru</h2><div class="tbl-wrap"><table>
    <thead><tr><th>ID</th><th>Pelanggan</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>${orders.slice(0, 6).map(o => `<tr><td>${o.id}</td><td>${esc(o.userName)}</td><td>${fmtDate(o.createdAt)}</td><td>${rp(o.total)}</td><td>${statusBadge(o.status)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Belum ada pesanan</td></tr>'}</tbody></table></div></div>
  <div class="panel"><h2>Stok Produk</h2><div class="tbl-wrap"><table>
    <thead><tr><th>Produk</th><th>Stok</th><th>Status</th></tr></thead>
    <tbody>${products.map(p => `<tr><td>${esc(p.name)}</td><td>${p.stock <= 5 ? `<span class="badge danger">${p.stock} (menipis)</span>` : p.stock}</td><td>${p.active ? '<span class="badge ok">Aktif</span>' : '<span class="badge">Nonaktif</span>'}</td></tr>`).join('')}</tbody></table></div></div>`;
})();
