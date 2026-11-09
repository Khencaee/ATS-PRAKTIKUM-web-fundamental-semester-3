(async () => {
  if (!(await initAdmin('users', 'Akun Pengguna'))) return;
  const me = API.currentUser(), root = $('#content');
  let q = '';

  async function draw() {
    const all = await API.users.list();
    const list = all.filter(u => !q || (u.name + u.email).toLowerCase().includes(q));
    root.innerHTML = `<div class="panel"><div class="toolbar"><input id="uq" class="grow" type="search" placeholder="Cari nama / email…" value="${esc(q)}"><button class="btn dark sm" id="addBtn">+ Tambah Pengguna</button></div>
    <div class="tbl-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Telepon</th><th>Peran</th><th>Status</th><th>Bergabung</th><th></th></tr></thead><tbody>
    ${list.map(u => `<tr><td><strong>${esc(u.name)}</strong></td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td>
      <td><span class="badge ${u.role === 'admin' ? 'info' : ''}">${u.role === 'admin' ? 'Admin' : 'Customer'}</span></td>
      <td>${u.active ? '<span class="badge ok">Aktif</span>' : '<span class="badge danger">Nonaktif</span>'}</td><td>${fmtDate(u.createdAt)}</td>
      <td><div class="actions"><button class="btn ghost sm" data-edit="${u.id}">Edit</button>${u.id !== me.id ? `<button class="btn ghost sm" data-del="${u.id}" style="color:var(--danger)">Hapus</button>` : ''}</div></td></tr>`).join('') || '<tr><td colspan="7" class="muted">Tidak ada data</td></tr>'}
    </tbody></table></div></div>`;
    const inp = $('#uq'); inp.oninput = () => { q = inp.value.trim().toLowerCase(); const pos = inp.selectionStart; draw().then(() => { const n = $('#uq'); n.focus(); n.setSelectionRange(pos, pos); }); };
  }

  function openForm(u) {
    const isNew = !u;
    u = u || { name: '', email: '', phone: '', role: 'customer', active: true };
    const self = !isNew && u.id === me.id;
    openModal({ title: isNew ? 'Tambah Pengguna' : 'Edit ' + u.name,
      body: `<div class="field"><label>Nama</label><input name="name" required value="${esc(u.name)}"></div>
      <div class="field"><label>Email</label><input name="email" type="email" required value="${esc(u.email)}"></div>
      <div class="field"><label>Telepon</label><input name="phone" value="${esc(u.phone)}"></div>
      <div class="field"><label>${isNew ? 'Password' : 'Password baru (kosongkan jika tidak diubah)'}</label><input name="password" type="password" ${isNew ? 'required' : ''} minlength="6"></div>
      <div class="grid-2"><div class="field"><label>Peran</label><select name="role" ${self ? 'disabled' : ''}><option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option></select></div>
      <div class="field"><label>Status</label><select name="active" ${self ? 'disabled' : ''}><option value="1" ${u.active ? 'selected' : ''}>Aktif</option><option value="0" ${!u.active ? 'selected' : ''}>Nonaktif</option></select></div></div>`,
      onSave: async fd => {
        const obj = { name: fd.get('name').trim(), email: fd.get('email').trim().toLowerCase(), phone: fd.get('phone').trim() };
        if (fd.get('password')) obj.password = fd.get('password');
        if (!self) { obj.role = fd.get('role'); obj.active = fd.get('active') === '1'; }
        if (isNew) { obj.address = ''; } else obj.id = u.id;
        await API.users.save(obj); toast('Pengguna disimpan'); draw();
      } });
  }

  root.addEventListener('click', async e => {
    if (e.target.id === 'addBtn') return openForm();
    if (e.target.dataset.edit) return openForm((await API.users.list()).find(x => x.id === Number(e.target.dataset.edit)));
    if (e.target.dataset.del) {
      const u = (await API.users.list()).find(x => x.id === Number(e.target.dataset.del));
      if (confirm('Hapus akun ' + u.email + '?')) { await API.users.remove(u.id); toast('Akun dihapus'); draw(); }
    }
  });
  draw();
})();
