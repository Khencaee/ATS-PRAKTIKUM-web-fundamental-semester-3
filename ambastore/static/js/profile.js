(() => {
  const u = requireLogin(); if (!u) return;
  const f = $('#profileForm');
  f.name.value = u.name; f.email.value = u.email; f.phone.value = u.phone || ''; f.address.value = u.address || '';
  f.onsubmit = async e => {
    e.preventDefault();
    await API.updateProfile(u.id, { name: f.name.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim() });
    toast('Profil diperbarui'); renderHeader();
  };
  const pf = $('#pwForm');
  pf.onsubmit = async e => {
    e.preventDefault(); $('#pwErr').textContent = '';
    if (pf.new.value !== pf.confirm.value) return ($('#pwErr').textContent = 'Konfirmasi password tidak sama');
    try { await API.changePassword(u.id, pf.old.value, pf.new.value); toast('Password diubah'); pf.reset(); }
    catch (ex) { $('#pwErr').textContent = ex.message; }
  };
})();
