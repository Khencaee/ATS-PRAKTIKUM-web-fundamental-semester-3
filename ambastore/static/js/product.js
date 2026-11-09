(async () => {
  const id = Number(location.pathname.split('/').filter(Boolean).pop());
  const root = $('#pdp');
  const p = await API.products.get(id);
  if (!p || !p.active) { root.innerHTML = '<div class="empty">Produk tidak ditemukan. <a href="/">Kembali ke beranda</a></div>'; return; }
  document.title = p.name + ' — ambaSTORE';
  $('#crumb').textContent = p.name;
  const st = { model: 'Pro', color: 0, ram: 8, storage: '256 GB', qty: 1, view: 'back' };

  function draw() {
    const c = p.colors[st.color];
    const price = calcPrice(p, st.model, st.ram, st.storage);
    const sku = `IP${p.series}${st.model === 'Pro' ? 'P' : 'PM'}-${st.ram}GB-${st.storage.replace(' ', '')}`;
    if (st.qty > p.stock) st.qty = Math.max(1, p.stock);
    const delta = v => v ? `<small>+${rp(v)}</small>` : '<small>Termasuk</small>';
    root.innerHTML = `<div class="pdp">
      <div class="gallery">
        <div class="main">${phoneSVG(c.hex, st.view === 'camera' ? 'camera' : st.view === 'front' ? 'front' : 'back')}</div>
        <div class="thumbs">
          <button class="thumb ${st.view === 'back' ? 'sel' : ''}" data-act="view" data-val="back">${phoneSVG(c.hex, 'back')}</button>
          <button class="thumb ${st.view === 'front' ? 'sel' : ''}" data-act="view" data-val="front">${phoneSVG(c.hex, 'front')}</button>
          <button class="thumb ${st.view === 'camera' ? 'sel' : ''}" data-act="view" data-val="camera">${phoneSVG(c.hex, 'camera')}</button>
          <div class="thumb text warm"><div>Sistem kamera Pro paling maksimal dengan kontrol Pro khusus.</div></div>
        </div>
      </div>
      <div class="info">
        ${p.tag ? `<div class="tagnew">${esc(p.tag)}</div>` : ''}
        <h1>${esc(p.name)} ${esc(st.model)}</h1>
        <div class="sku">SKU: ${sku}</div>
        <div class="price-big">${rp(price)}</div>
        <div class="inst">atau <b>${rp(price / 24)}/bln.</b> untuk 24 bln.*</div>
        <span class="sim">Simulasi cicilan dan Paylater ›</span>
        <p class="desc">${esc(p.desc)}</p>

        <div class="opt-title">Warna – <span>${esc(c.name)}</span></div>
        <div class="swatches">${p.colors.map((x, i) => `<button class="sw ${i === st.color ? 'sel' : ''}" title="${esc(x.name)}" data-act="color" data-val="${i}" style="background:${esc(x.hex)}"></button>`).join('')}</div>

        <div class="opt-title">Model</div>
        <div class="opts">${OPTIONS.models.map(m => `<button class="opt ${m === st.model ? 'sel' : ''}" data-act="model" data-val="${m}"><span>${esc(p.name)} ${m}</span>${delta(p.basePrice[m] - p.basePrice.Pro)}</button>`).join('')}</div>

        <div class="opt-title">RAM</div>
        <div class="opts row3">${OPTIONS.ram.map(r => `<button class="opt ${r.value === st.ram ? 'sel' : ''}" data-act="ram" data-val="${r.value}"><span>${r.value} GB</span>${delta(r.add)}</button>`).join('')}</div>

        <div class="opt-title">Kapasitas</div>
        <div class="opts row3">${OPTIONS.storage.map(s => `<button class="opt ${s.value === st.storage ? 'sel' : ''}" data-act="storage" data-val="${s.value}"><span>${s.value}</span>${delta(s.add)}</button>`).join('')}</div>

        <div class="opt-title">Jumlah</div>
        <div class="row"><div class="qty"><button data-act="dec" aria-label="Kurangi">−</button><span>${st.qty}</span><button data-act="inc" aria-label="Tambah">+</button></div>
          <span class="stock ${p.stock <= 5 ? 'low' : ''}">${p.stock > 0 ? 'Stok tersedia: ' + p.stock : 'Stok habis'}</span></div>

        <div class="buy">
          <button class="btn dark" data-act="add" ${p.stock < 1 ? 'disabled' : ''}>+ Tambah ke Keranjang</button>
          <button class="btn" data-act="buy" ${p.stock < 1 ? 'disabled' : ''}>Beli Sekarang</button>
        </div>
        <div class="perks">
          <div class="perk"><b>Dapatkan segera</b><span>Pengiriman gratis ke seluruh Indonesia</span></div>
          <div class="perk"><b>Pilihan pembayaran</b><span>Transfer bank, upload bukti transfer setelah checkout</span></div>
        </div>
      </div></div>`;
  }

  function item() {
    const c = p.colors[st.color];
    return { productId: p.id, name: p.name, model: st.model, color: c.name, colorHex: c.hex, ram: st.ram, storage: st.storage, qty: st.qty };
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.act) {
      case 'view': st.view = v; break;
      case 'color': st.color = Number(v); break;
      case 'model': st.model = v; break;
      case 'ram': st.ram = Number(v); break;
      case 'storage': st.storage = v; break;
      case 'dec': st.qty = Math.max(1, st.qty - 1); break;
      case 'inc': if (st.qty < p.stock) st.qty++; else toast('Stok maksimal tercapai', 'err'); break;
      case 'add': API.cart.add(item()); updateCartBadge(); toast('Ditambahkan ke keranjang'); return;
      case 'buy': API.cart.add(item()); location.href = '/cart'; return;
    }
    draw();
  });
  draw();

  /* ---------- Review ---------- */
  async function drawReviews() {
    const list = await API.reviews.list(p.id), u = API.currentUser();
    const avg = list.length ? list.reduce((a, b) => a + b.rating, 0) / list.length : 0;
    $('#reviews').innerHTML = `<h2>Ulasan Pelanggan</h2>
      <p class="muted">${list.length ? `${stars(avg)} ${avg.toFixed(1)} dari ${list.length} ulasan` : 'Belum ada ulasan.'}</p>
      ${list.map(r => `<div class="rv"><div class="st">${stars(r.rating)}</div><strong>${esc(r.userName)}</strong> <small>· ${fmtDate(r.date)}</small><p>${esc(r.text)}</p></div>`).join('')}
      <div class="rv-form">${u ? `<form id="rvForm"><div class="field"><label>Rating</label><select name="rating"><option value="5">★★★★★ (5)</option><option value="4">★★★★☆ (4)</option><option value="3">★★★☆☆ (3)</option><option value="2">★★☆☆☆ (2)</option><option value="1">★☆☆☆☆ (1)</option></select></div><div class="field"><label>Ulasan</label><textarea name="text" required maxlength="400" placeholder="Ceritakan pengalamanmu…"></textarea></div><button class="btn dark">Kirim Ulasan</button></form>` : `<p>Silakan <a href="/login?redirect=${encodeURIComponent('/product/' + p.id)}"><u>masuk</u></a> untuk menulis ulasan.</p>`}</div>`;
    const f = $('#rvForm');
    if (f) f.onsubmit = async e => {
      e.preventDefault();
      await API.reviews.add({ productId: p.id, rating: f.rating.value, text: f.text.value.trim() });
      toast('Terima kasih atas ulasanmu'); drawReviews();
    };
  }
  drawReviews();
})();
