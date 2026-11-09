(async () => {
  const grid = $('#grid'), qEl = $('#fq'), sEl = $('#fseries'), oEl = $('#fsort'), cnt = $('#count');
  const params = new URLSearchParams(location.search);
  qEl.value = params.get('q') || '';
  sEl.value = params.get('series') || '';
  const [products, reviews] = await Promise.all([API.products.list(), API.reviews.list()]);
  const minPrice = p => Math.min(...Object.values(p.basePrice));
  const rating = p => {
    const r = reviews.filter(x => x.productId === p.id);
    return { n: r.length, avg: r.length ? r.reduce((a, b) => a + b.rating, 0) / r.length : 0 };
  };

  function render() {
    const q = qEl.value.trim().toLowerCase();
    let list = products.filter(p =>
      (!sEl.value || String(p.series) === sEl.value) &&
      (!q || [p.name, p.tagline, p.desc, ...p.colors.map(c => c.name)].join(' ').toLowerCase().includes(q)));
    const o = oEl.value;
    list.sort((a, b) => o === 'low' ? minPrice(a) - minPrice(b) : o === 'high' ? minPrice(b) - minPrice(a) : o === 'rating' ? rating(b).avg - rating(a).avg : b.series - a.series);
    cnt.textContent = `(${list.length} seri)`;
    if (!list.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Produk tidak ditemukan.</div>'; return; }
    grid.innerHTML = list.map(p => {
      const r = rating(p);
      return `<a class="card" href="/product/${p.id}">
        <div class="card-img">${phoneSVG(p.colors[0].hex, 'back')}</div>
        <div class="tag ${p.tag === 'PRE-ORDER' ? 'pre' : ''}">${esc(p.tag)}</div>
        <h3>${esc(p.name)} Pro</h3>
        <p class="tagline">${esc(p.tagline)}</p>
        <div class="dots">${p.colors.map(c => `<i title="${esc(c.name)}" style="background:${esc(c.hex)}"></i>`).join('')}<small>Pro &amp; Pro Max</small></div>
        ${r.n ? `<div class="rate">${stars(r.avg)} <span class="muted">${r.avg.toFixed(1)} (${r.n})</span></div>` : ''}
        <p class="price">Mulai ${rp(minPrice(p))}</p></a>`;
    }).join('');
  }
  [qEl, sEl, oEl].forEach(e => e.addEventListener('input', render));
  render();
})();
