(async () => {
  if (!(await initAdmin('payments', 'Approval Bukti Bayar'))) return;
  const root = $('#content');
  let tab = 'awaiting_verification';
  const TABS = [['awaiting_verification', 'Menunggu'], ['paid', 'Disetujui'], ['rejected', 'Ditolak'], ['awaiting_payment', 'Belum upload']];

  async function draw() {
    const all = await API.orders.listAll();
    const list = all.filter(o => o.status === tab);
    root.innerHTML = `<div class="tabs">${TABS.map(([k, l]) => `<button class="tab ${k === tab ? 'sel' : ''}" data-tab="${k}">${l} (${all.filter(o => o.status === k).length})</button>`).join('')}</div>
    <div class="proof-grid">${list.map(o => `<div class="pcard">
      ${o.proof ? `<img src="${o.proof}" alt="Bukti" data-zoom>` : '<div class="muted" style="font-size:13px">Belum ada bukti</div>'}
      <div><h3>${o.id}</h3><div class="meta">${esc(o.userName)} · ${fmtDate(o.createdAt)}<br>Bank ${esc(o.bank)}</div>
        ${o.items.map(i => `<div style="font-size:13px">${itemLabel(i)} ×${i.qty}</div>`).join('')}
        <div style="font-weight:700;margin-top:8px">${rp(o.total)}</div>${statusBadge(o.status)}${o.note ? `<div class="meta">Catatan: ${esc(o.note)}</div>` : ''}
        ${o.status === 'awaiting_verification' ? `<div class="btns"><button class="btn ok sm" data-ok="${o.id}">Setujui</button><button class="btn danger sm" data-no="${o.id}">Tolak</button></div>` : ''}
        ${o.status === 'paid' ? `<div class="btns"><button class="btn ghost sm" data-no="${o.id}">Batalkan persetujuan</button></div>` : ''}</div></div>`).join('') || '<div class="empty" style="grid-column:1/-1">Tidak ada data.</div>'}</div>`;
  }

  root.addEventListener('click', async e => {
    const t = e.target;
    if (t.dataset.tab) { tab = t.dataset.tab; return draw(); }
    if (t.matches('[data-zoom]')) return openModal({ title: 'Bukti Transfer', body: `<img class="big-proof" src="${t.src}">` });
    if (t.dataset.ok) {
      if (confirm('Setujui pembayaran ' + t.dataset.ok + '?')) { await API.orders.review(t.dataset.ok, true); toast('Pembayaran disetujui'); await initAdmin('payments', 'Approval Bukti Bayar'); draw(); }
    }
    if (t.dataset.no) {
      const id = t.dataset.no;
      openModal({ title: 'Tolak pembayaran ' + id, saveLabel: 'Tolak',
        body: '<div class="field"><label>Alasan penolakan</label><textarea name="note" required placeholder="Contoh: nominal tidak sesuai / bukti tidak terbaca"></textarea></div><p class="muted" style="font-size:12px">Stok barang akan dikembalikan.</p>',
        onSave: async fd => { await API.orders.review(id, false, fd.get('note').trim()); toast('Pembayaran ditolak'); await initAdmin('payments', 'Approval Bukti Bayar'); draw(); } });
    }
  });
  draw();
})();
