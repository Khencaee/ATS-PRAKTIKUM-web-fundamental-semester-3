(async () => {
  const u = requireLogin(); if (!u) return;
  const cart = API.cart.get();
  if (!cart.length) { location.replace('/cart'); return; }
  const products = await API.products.list();
  const f = $('#checkout');
  f.receiver.value = u.name; f.phone.value = u.phone || ''; f.address.value = u.address || '';

  $('#banks').innerHTML = BANKS.map((b, i) => `<label class="bank"><input type="radio" name="bank" value="${b.bank}" ${i === 0 ? 'checked' : ''}><div><strong>Bank ${b.bank}</strong><small>${b.no} a.n. ${b.name}</small></div></label>`).join('');

  let total = 0;
  $('#sumItems').innerHTML = cart.map(c => {
    const p = products.find(x => x.id === c.productId); if (!p) return '';
    const sub = calcPrice(p, c.model, c.ram, c.storage) * c.qty; total += sub;
    return `<div class="sum-row"><span>${esc(c.name)} ${esc(c.model)} <small class="muted">${esc(c.color)} · ${c.ram}GB · ${esc(c.storage)} ×${c.qty}</small></span><span>${rp(sub)}</span></div>`;
  }).join('');
  $('#sumTotal').textContent = rp(total);

  f.onsubmit = async e => {
    e.preventDefault(); $('#err').textContent = '';
    const btn = $('#placeBtn'); btn.disabled = true;
    try {
      const o = await API.orders.create({ receiver: f.receiver.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim(), bank: f.bank.value });
      await API.updateProfile(u.id, { phone: f.phone.value.trim(), address: f.address.value.trim() });
      location.href = '/orders?new=' + encodeURIComponent(o.id);
    } catch (ex) { $('#err').textContent = ex.message; btn.disabled = false; }
  };
})();
