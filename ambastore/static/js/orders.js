(async () => {
  if (!requireLogin()) return;
  const root = $('#orders');
  const newId = new URLSearchParams(location.search).get('new');
  const files = {}; // orderId -> dataURL (sudah dikecilkan)

  async function draw() {
    const list = await API.orders.listMine();
    if (!list.length) { root.innerHTML = '<div class="empty">Belum ada pesanan.<br><br><a class="btn dark" href="/">Belanja Sekarang</a></div>'; return; }
    root.innerHTML = list.map(o => {
      const bank = BANKS.find(b => b.bank === o.bank) || BANKS[0];
      const canUpload = o.status === 'awaiting_payment' || o.status === 'rejected';
      let pay = '';
      if (canUpload) pay = `<div>${o.status === 'rejected' ? `<div class="alert">Pembayaran ditolak${o.note ? ': ' + esc(o.note) : ''}. Silakan upload ulang bukti transfer.</div>` : ''}
          <div class="note-box">Transfer <strong>${rp(o.total)}</strong> ke<br><strong>Bank ${esc(bank.bank)} ${esc(bank.no)}</strong><br>a.n. ${esc(bank.name)}</div></div>
        <div><div class="field"><label>Upload bukti transfer</label><input type="file" accept="image/*" data-file="${o.id}"></div>
          <img class="proof hidden" data-prev="${o.id}" alt="Pratinjau"><button class="btn dark sm" data-send="${o.id}" style="margin-top:10px">Kirim Bukti</button></div>`;
      else pay = `<div><p class="muted" style="font-size:13px;margin-bottom:8px">Bukti transfer</p><img class="proof" src="${o.proof}" alt="Bukti transfer" data-zoom></div>
        <div>${o.status === 'awaiting_verification' ? '<div class="note-box">Bukti sudah terkirim. Menunggu verifikasi admin.</div>' : '<div class="note-box" style="background:#dcfce7">Pembayaran disetujui. Pesanan sedang diproses.</div>'}</div>`;
      return `<div class="order ${o.id === newId ? 'new' : ''}"><div class="order-head"><div><strong>${o.id}</strong><br><small>${fmtDate(o.createdAt)}</small></div>${statusBadge(o.status)}</div>
        <div class="order-body">${o.items.map(i => `<div class="oi"><span>${itemLabel(i)} ×${i.qty}</span><span>${rp(i.price * i.qty)}</span></div>`).join('')}
          <div class="oi" style="font-weight:700;border-top:1px solid var(--line);margin-top:6px;padding-top:10px"><span>Total</span><span>${rp(o.total)}</span></div>
          <p class="muted" style="font-size:13px;margin-top:8px">Dikirim ke: ${esc(o.receiver)}, ${esc(o.phone)} — ${esc(o.address)}</p>
          <div class="order-pay">${pay}</div></div></div>`;
    }).join('');
    if (newId) toast('Pesanan dibuat! Silakan upload bukti transfer.');
  }

  root.addEventListener('change', async e => {
    const inp = e.target.closest('[data-file]'); if (!inp || !inp.files[0]) return;
    try {
      files[inp.dataset.file] = await fileToDataURL(inp.files[0]);
      const img = $(`[data-prev="${inp.dataset.file}"]`); img.src = files[inp.dataset.file]; img.classList.remove('hidden');
    } catch (ex) { toast(ex.message, 'err'); inp.value = ''; }
  });
  root.addEventListener('click', async e => {
    if (e.target.matches('[data-zoom]')) { openModal({ title: 'Bukti Transfer', body: `<img class="big-proof" src="${e.target.src}">` }); return; }
    const b = e.target.closest('[data-send]'); if (!b) return;
    const id = b.dataset.send;
    if (!files[id]) return toast('Pilih file bukti transfer dulu', 'err');
    await API.orders.uploadProof(id, files[id]); delete files[id];
    toast('Bukti transfer terkirim'); history.replaceState(null, '', '/orders'); draw();
  });
  draw();
})();
