# ambaSTORE — E-Commerce iPhone (Flask)

Framework: **Flask saja** (tanpa extension/library Python lain). Front end memakai HTML (Jinja), CSS, dan JavaScript biasa.
Data sementara disimpan di `localStorage` browser, jadi bisa jalan tanpa database. Backend menyusul.

## Cara menjalankan
```
pip install -r requirements.txt
python app.py
```
Buka http://127.0.0.1:5000

## Akun demo
- Admin: `admin@ambastore.com` / `admin123` (otomatis masuk ke panel `/admin`)
- Customer: `demo@ambastore.com` / `user123`

Reset data demo: ketik `API.resetDemo()` di console browser, lalu refresh.

## Struktur
```
app.py                  rute Flask (halaman saja untuk saat ini)
requirements.txt        hanya Flask
templates/base.html     kerangka halaman customer (Jinja)
templates/*.html        index, product, cart, checkout, orders, profile, login, register, 404
templates/admin/        admin_base.html + dashboard, products, users, transactions, payments
static/css/             base, shop, auth, admin
static/js/api.js        SATU-SATUNYA tempat data (ganti ke fetch() ke route Flask saat backend siap)
static/js/ui.js         navbar, footer, modal, toast, gambar iPhone (SVG)
static/js/*.js          satu file JS per halaman
```

## Route
Customer: `/`, `/product/<id>`, `/cart`, `/checkout`, `/orders`, `/profile`, `/login`, `/register`
Admin: `/admin`, `/admin/products`, `/admin/users`, `/admin/transactions`, `/admin/payments`

## Fitur
Customer: login/daftar, profil, cari/filter/urut produk, review, pilih warna/model/RAM/kapasitas/jumlah, keranjang, checkout, upload bukti transfer, riwayat pesanan.
Admin: CRUD produk, manajemen akun, laporan transaksi (filter, CSV, cetak), approval/tolak bukti bayar.

## Saat membuat backend (nanti)
Tambahkan rute API di `app.py` (daftar rencananya ada di komentar bagian bawah file), lalu ganti isi fungsi di `static/js/api.js` dengan `fetch()`.
Catatan: pakai `session` bawaan Flask untuk login, hash password (`werkzeug.security`, sudah termasuk Flask), cek role admin di server (bukan hanya di JS), dan validasi stok saat checkout di server.
