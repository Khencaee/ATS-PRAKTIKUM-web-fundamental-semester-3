(() => {
  const err = $('#err');
  const params = new URLSearchParams(location.search);
  const safeRedirect = r => (r && /^\/(?!\/)[\w\-\/]*(\?[\w=&%.\-]*)?$/.test(r)) ? r : '/';
  const go = u => { location.href = u.role === 'admin' ? '/admin' : safeRedirect(params.get('redirect')); };

  const lf = $('#loginForm');
  if (lf) {
    if (API.currentUser()) go(API.currentUser());
    $('#forgot').onclick = e => { e.preventDefault(); toast('Reset password aktif setelah backend tersambung', 'err'); };
    lf.onsubmit = async e => {
      e.preventDefault(); err.textContent = '';
      try { go(await API.login(lf.email.value, lf.password.value)); }
      catch (ex) { err.textContent = ex.message; }
    };
  }

  const rf = $('#registerForm');
  if (rf) rf.onsubmit = async e => {
    e.preventDefault(); err.textContent = '';
    if (!rf.name.value.trim()) return (err.textContent = 'Nama wajib diisi');
    if (!/^\S+@\S+\.\S+$/.test(rf.email.value)) return (err.textContent = 'Format email tidak valid');
    if (rf.password.value.length < 6) return (err.textContent = 'Password minimal 6 karakter');
    if (rf.password.value !== rf.confirm.value) return (err.textContent = 'Konfirmasi password tidak sama');
    try { await API.register({ name: rf.name.value, email: rf.email.value, phone: rf.phone.value, password: rf.password.value }); location.href = safeRedirect(params.get('redirect')); }
    catch (ex) { err.textContent = ex.message; }
  };
})();
