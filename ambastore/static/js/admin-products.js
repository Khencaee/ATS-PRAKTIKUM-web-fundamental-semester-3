(async () => {
  if (!(await initAdmin('products', 'Katalog Produk'))) return;
  const root = $('#content');

  async function draw() {
    const list = await API.products.list({ all: true });
    root.innerHTML = `<div class="panel"><div class="toolbar"><span class="grow muted">${list.length} produk</span><button class="btn dark sm" id="addBtn">+ Tambah Produk</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>Produk</th><th>Harga Pro</th><th>Harga Pro Max</th><th>Warna</th><th>Stok</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.map(p => `<tr><td><div class="prod-cell"><div class="th">${phoneSVG(p.colors[0] ? p.colors[0].hex : '#999', 'back')}</div><div><strong>${esc(p.name)}</strong><br><small class="muted">${esc(p.tagline)}</small></div></div></td>
      <td>${rp(p.basePrice.Pro)}</td><td>${rp(p.basePrice['Pro Max'])}</td>
      <td>${p.colors.map(c => `<span class="mini-sw" title="${esc(c.name)}" style="background:${esc(c.hex)}"></span>`).join('')}</td>
      <td>${p.stock}</td><td>${p.active ? '<span class="badge ok">Aktif</span>' : '<span class="badge">Nonaktif</span>'}</td>
      <td><div class="actions"><button class="btn ghost sm" data-edit="${p.id}">Edit</button><button class="btn ghost sm" data-del="${p.id}" style="color:var(--danger)">Hapus</button></div></td></tr>`).join('')}
    </tbody></table></div></div>`;
  }

  const formHTML = p => `
    <div class="grid-2"><div class="field"><label>Nama produk</label><input name="name" required value="${esc(p.name)}" placeholder="iPhone 17"></div>
      <div class="field"><label>Seri (angka)</label><input name="series" type="number" required value="${esc(p.series)}"></div></div>
    <div class="grid-2"><div class="field"><label>Label</label><select name="tag"><option value="" ${!p.tag ? 'selected' : ''}>Tanpa label</option><option value="NEW" ${p.tag === 'NEW' ? 'selected' : ''}>NEW</option><option value="PRE-ORDER" ${p.tag === 'PRE-ORDER' ? 'selected' : ''}>PRE-ORDER</option></select></div>
      <div class="field"><label>Tagline</label><input name="tagline" value="${esc(p.tagline)}"></div></div>
    <div class="field"><label>Deskripsi</label><textarea name="desc">${esc(p.desc)}</textarea></div>
    <div class="grid-2"><div class="field"><label>Harga dasar Pro (Rp)</label><input name="pricePro" type="number" min="0" required value="${esc(p.basePrice.Pro)}"></div>
      <div class="field"><label>Harga dasar Pro Max (Rp)</label><input name="pricePM" type="number" min="0" required value="${esc(p.basePrice['Pro Max'])}"></div></div>
    <div class="field"><label>Warna (satu per baris: Nama|#hex)</label><textarea name="colors" required placeholder="Deep Blue|#2e4a78">${esc(p.colors.map(c => c.name + '|' + c.hex).join('\n'))}</textarea></div>
    <div class="grid-2"><div class="field"><label>Stok</label><input name="stock" type="number" min="0" required value="${esc(p.stock)}"></div>
      <div class="field"><label>&nbsp;</label><label class="check"><input type="checkbox" name="active" ${p.active ? 'checked' : ''} style="width:auto"> Tampilkan di toko</label></div></div>
    <p class="muted" style="font-size:12px">Harga akhir = harga dasar + tambahan RAM (16 GB +Rp2,5 jt, 32 GB +Rp6 jt) + tambahan penyimpanan (512 GB +Rp3 jt, 1 TB +Rp7 jt).</p>`;

  function parseColors(txt) {
    const out = [];
    for (const line of txt.split('\n').map(l => l.trim()).filter(Boolean)) {
      const m = line.match(/^(.+?)\s*[|,]\s*(#[0-9a-fA-F]{6})$/);
      if (!m) throw new Error('Format warna salah: "' + line + '" (contoh: Deep Blue|#2e4a78)');
      out.push({ name: m[1].trim(), hex: m[2].toLowerCase() });
    }
    if (!out.length) throw new Error('Minimal satu warna');
    return out;
  }

  function openForm(p) {
    const isNew = !p;
    p = p || { name: '', series: '', tag: '', tagline: '', desc: '', basePrice: { Pro: '', 'Pro Max': '' }, colors: [], stock: 0, active: true };
    openModal({ title: isNew ? 'Tambah Produk' : 'Edit ' + p.name, body: formHTML(p), wide: true,
      onSave: async fd => {
        const obj = { name: fd.get('name').trim(), series: Number(fd.get('series')), tag: fd.get('tag'), tagline: fd.get('tagline').trim(), desc: fd.get('desc').trim(),
          basePrice: { 'Pro': Number(fd.get('pricePro')), 'Pro Max': Number(fd.get('pricePM')) }, colors: parseColors(fd.get('colors')), stock: Number(fd.get('stock')), active: fd.get('active') === 'on' };
        if (!isNew) obj.id = p.id;
        await API.products.save(obj); toast('Produk disimpan'); draw();
      } });
  }

  root.addEventListener('click', async e => {
    if (e.target.id === 'addBtn') return openForm();
    if (e.target.dataset.edit) return openForm(await API.products.get(e.target.dataset.edit));
    if (e.target.dataset.del) {
      const p = await API.products.get(e.target.dataset.del);
      if (confirm('Hapus produk "' + p.name + '"? Ulasannya ikut terhapus.')) { await API.products.remove(p.id); toast('Produk dihapus'); draw(); }
    }
  });
  draw();
})();
