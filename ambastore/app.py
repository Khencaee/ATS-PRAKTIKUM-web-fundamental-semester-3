"""
ambaSTORE — aplikasi Flask (hanya memakai Flask, tanpa library lain).

Saat ini Flask hanya menyajikan halaman (template Jinja + file static).
Data sementara masih disimpan di browser lewat static/js/api.js.
Backend/database menyusul: rute API tinggal ditambahkan di bagian
"RUTE API (BELUM DIBUAT)" di bawah, lalu api.js diganti ke fetch().
"""
from flask import Flask, render_template

app = Flask(__name__)
# Nanti dipakai untuk session/cookie login saat backend dibuat. Ganti dengan nilai rahasia sendiri.
app.config["SECRET_KEY"] = "ganti-dengan-kunci-rahasia"


# ---------------------------- HALAMAN CUSTOMER ----------------------------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/product/<int:product_id>")
def product(product_id):
    # product_id dibaca oleh static/js/product.js dari URL
    return render_template("product.html")


@app.route("/cart")
def cart():
    return render_template("cart.html")


@app.route("/checkout")
def checkout():
    return render_template("checkout.html")


@app.route("/orders")
def orders():
    return render_template("orders.html")


@app.route("/profile")
def profile():
    return render_template("profile.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/register")
def register():
    return render_template("register.html")


# ------------------------------ HALAMAN ADMIN -----------------------------
@app.route("/admin")
def admin_dashboard():
    return render_template("admin/dashboard.html")


@app.route("/admin/products")
def admin_products():
    return render_template("admin/products.html")


@app.route("/admin/users")
def admin_users():
    return render_template("admin/users.html")


@app.route("/admin/transactions")
def admin_transactions():
    return render_template("admin/transactions.html")


@app.route("/admin/payments")
def admin_payments():
    return render_template("admin/payments.html")


# ------------------------- RUTE API (BELUM DIBUAT) -------------------------
# Contoh yang akan dibuat nanti (menggantikan localStorage di api.js):
#   POST /api/auth/login, POST /api/auth/register, POST /api/auth/logout
#   GET/POST/PUT/DELETE /api/products
#   GET/POST /api/products/<id>/reviews
#   POST /api/orders, GET /api/orders, POST /api/orders/<id>/proof
#   admin: GET /api/admin/orders, POST /api/admin/orders/<id>/review, /api/admin/users


@app.errorhandler(404)
def not_found(_e):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)
