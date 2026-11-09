(async () => {
  const root = $('#cart');
  const products = await API.products.list();

  function draw() {
    let cart = API.cart.get();
    // buang item yang produknya sudah tidak ada / nonaktif
    const valid = cart.filter(c => products.some(p => p.id === c.productId));
    if (valid.length !== cart.length) { API.cart.save(valid); cart = valid; updateCartBadge(); }
    if (!cart.length) { root.innerHTML = '<div class="empty">Keranjangmu masih kosong.<br><br><a class="btn dark" href="/">Mulai Belanja</a></div>'; return; }
    let total = 0;
    const rows = cart.map(c => {
      const p = products.find(x => x.id === c.productId);
      const unit = calcPrice(p, c.model, c.ram, c.storage), sub = unit * c.qty; total += sub;
      return `<div class="cart-item">
        <div class="im">${phoneSVG(c.colorHex, 'back')}</div>
        <div><h3>${esc(c.name)} ${esc(c.model)}</h3>
          <div class="meta">${esc(c.color)} · ${c.ram} GB RAM · ${esc(c.storage)}<br>${rp(unit)} / unit · stok ${p.stock}</div>
          <div class="qty"><button data-act="dec" data-key="${esc(c.key)}">−</button><span>${c.qty}</span><button data-act="inc" data-key="${esc(c.key)}">+</button></div></div>
        <div class="sub"><span>${rp(sub)}</span><button class="link-del" data-act="del" data-key="${esc(c.key)}">Hapus</button></div></div>`;
    }).join('');
    root.innerHTML = `<div class="cart-layout"><div>${rows}</div>
      <aside class="summary"><h3>Ringkasan</h3>
        <div class="sum-row"><span>Subtotal (${API.cart.count()} barang)</span><span>${rp(total)}</span></div>
        <div class="sum-row"><span>Ongkos kirim</span><span>Gratis</span></div>
        <div class="sum-row total"><span>Total</span><span>${rp(total)}</span></div>
        <a class="btn dark block" style="margin-top:16px" href="/checkout">Lanjut ke Checkout</a>
        <a class="btn ghost block" style="margin-top:10px" href="/">Tambah Produk Lain</a></aside></div>`;
  }

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const key = b.dataset.key, it = API.cart.get().find(x => x.key === key); if (!it) return;
    const p = products.find(x => x.id === it.productId);
    if (b.dataset.act === 'del') API.cart.remove(key);
    else if (b.dataset.act === 'dec') API.cart.setQty(key, it.qty - 1);
    else if (it.qty < p.stock) API.cart.setQty(key, it.qty + 1);
    else toast('Stok maksimal tercapai', 'err');
    updateCartBadge(); draw();
  });
  draw();
})();
