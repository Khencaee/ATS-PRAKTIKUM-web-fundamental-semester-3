(async () => {
  if (!(await initAdmin('transactions', 'Laporan Transaksi'))) return;
  const root = $('#content');
  const all = await API.orders.listAll();
  const f = { status: '', from: '', to: '', q: '' };

  const filtered = () => all.filter(o => {
    if (f.status && o.status !== f.status) return false;
    if (f.from && o.createdAt < new Date(f.from + 'T00:00:00').getTime()) return false;
    if (f.to && o.createdAt > new Date(f.to + 'T23:59:59').getTime()) return false;
    if (f.q && !(o.id + o.userName).toLowerCase().includes(f.q)) return false;
    return true;
  });

  function draw() {
    const l = filtered();
    const paid = l.filter(o => o.status === 'paid');
    root.innerHTML = `
    <div class="stats">
      <div class="stat"><small>Jumlah transaksi</small><b>${l.length}</b></div>
      <div class="stat"><small>Pendapatan (disetujui)</small><b>${rp(paid.reduce((a, o) => a + o.total, 0))}</b></div>
      <div class="stat"><small>Unit terjual</small><b>${paid.reduce((a, o) => a + o.items.reduce((x, i) => x + i.qty, 0), 0)}</b></div>
      <div class="stat"><small>Belum lunas / diverifikasi</small><b>${l.filter(o => o.status === 'awaiting_payment' || o.status === 'awaiting_verification').length}</b></div>
    </div>
    <div class="panel"><div class="toolbar">
      <input id="fq" type="search" placeholder="Cari ID / pelanggan" value="${esc(f.q)}">
      <select id="fs"><option value="">Semua status</option>${Object.entries(ORDER_STATUS).map(([k, v]) => `<option value="${k}" ${f.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
      <input id="ff" type="date" value="${f.from}" title="Dari tanggal"><input id="ft" type="date" value="${f.to}" title="Sampai tanggal">
      <span class="grow"></span><button class="btn ghost sm" id="csv">Export CSV</button><button class="btn dark sm" id="print">Cetak</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Tanggal</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>
    ${l.map(o => `<tr><td>${o.id}</td><td>${fmtDate(o.createdAt)}</td><td>${esc(o.userName)}</td><td>${o.items.reduce((a, i) => a + i.qty, 0)}</td><td>${rp(o.total)}</td><td>${statusBadge(o.status)}</td><td><div class="actions"><button class="btn ghost sm" data-d="${o.id}">Detail</button></div></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Tidak ada transaksi</td></tr>'}
    </tbody></table></div></div>`;
    const bind = (id, key, ev = 'input') => { $(id).addEventListener(ev, e => { f[key] = e.target.value.trim().toLowerCase(); if (key !== 'q') f[key] = e.target.value; const pos = e.target.selectionStart; draw(); if (key === 'q') { const n = $(id); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } }); };
    bind('#fq', 'q'); bind('#fs', 'status', 'change'); bind('#ff', 'from', 'change'); bind('#ft', 'to', 'change');
    $('#print').onclick = () => print();
    $('#csv').onclick = () => {
      const rows = [['ID', 'Tanggal', 'Pelanggan', 'Item', 'Total', 'Status', 'Bank']].concat(l.map(o => [o.id, new Date(o.createdAt).toISOString(), o.userName, o.items.map(i => `${i.name} ${i.model} ${i.color} ${i.ram}GB ${i.storage} x${i.qty}`).join('; '), o.total, ORDER_STATUS[o.status].label, o.bank]));
      const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'laporan-transaksi.csv'; a.click();
    };
  }

  root.addEventListener('click', e => {
    const id = e.target.dataset.d; if (!id) return;
    const o = all.find(x => x.id === id);
    openModal({ title: 'Detail ' + o.id, wide: true, body: `<div class="detail-list">
      <div><span>Pelanggan</span><span>${esc(o.userName)}</span></div><div><span>Tanggal</span><span>${fmtDate(o.createdAt)}</span></div>
      <div><span>Penerima</span><span>${esc(o.receiver)} (${esc(o.phone)})</span></div><div><span>Alamat</span><span>${esc(o.address)}</span></div>
      <div><span>Bank tujuan</span><span>${esc(o.bank)}</span></div><div><span>Status</span><span>${statusBadge(o.status)}</span></div>
      ${o.note ? `<div><span>Catatan admin</span><span>${esc(o.note)}</span></div>` : ''}
      ${o.items.map(i => `<div><span>${itemLabel(i)} ×${i.qty}</span><span>${rp(i.price * i.qty)}</span></div>`).join('')}
      <div><strong>Total</strong><strong>${rp(o.total)}</strong></div></div>${o.proof ? `<p class="muted" style="margin:14px 0 6px;font-size:13px">Bukti transfer</p><img class="big-proof" style="max-height:340px" src="${o.proof}">` : ''}` });
  });
  draw();
})();
