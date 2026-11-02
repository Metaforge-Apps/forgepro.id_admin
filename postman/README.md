# Panduan Integrasi Postman & GitHub — ForgePro.id

Direktori ini berisi koleksi Postman resmi dan variabel lingkungan untuk **ForgePro.id Admin Panel & REST API**.

---

## 📁 Berkas yang Tersedia

1. **`ForgePro_Admin_API.postman_collection.json`**
   - Berisi seluruh definisi endpoint REST API:
     - `1. Pesanan & Transaksi Digital (/orders)`
     - `2. Katalog Gaya Jas AI (/styles)`
     - `3. Paket & Harga IAP (/packages)`
     - `4. Voucher & Kode Promo (/vouchers)`
     - `5. Log Aktivitas & Webhook (/webhooks)`
   - Setiap endpoint dilengkapi *mock request body*, *headers*, *parameters*, dan contoh *response JSON 200 OK & 201 Created*.

2. **`ForgePro_Environment.postman_environment.json`**
   - Variabel `baseUrl`: `http://localhost:8080/api/v1` (atau URL Postman Mock Server).
   - Variabel `authToken`: `demo_token_admin`.

---

## 🚀 3 Cara Menghubungkan ke Front-End

### Cara 1: Menggunakan Postman Mock Server (Paling Direkomendasikan)
1. Buka Postman, klik **Import** lalu pilih berkas `ForgePro_Admin_API.postman_collection.json`.
2. Klik kanan pada koleksi **ForgePro.id - Admin & Core REST API** > pilih **Mock collection**.
3. Beri nama Mock Server (misal `ForgePro Mock`), lalu klik **Create Mock Server**.
4. Salin URL Mock yang dihasilkan (contoh: `https://xxxx-xxxx.mock.pstmn.io/api/v1`).
5. Buka berkas [`.env`](../.env) pada proyek ini, lalu ubah:
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=https://xxxx-xxxx.mock.pstmn.io/api/v1
   ```
6. Front-end langsung memanggil dan menerima respons dari Postman Mock Server Anda secara real-time!

---

### Cara 2: Sinkronisasi Otomatis via Integrasi GitHub di Postman
Karena akun GitHub Anda sudah terhubung ke Postman:
1. Di workspace Postman Anda, pilih menu **APIs** > **Create API**.
2. Klik tab **Source Control / Connect Repository**, lalu pilih repositori `Metaforge-Apps/forgepro.id_admin` dan branch `master`.
3. Arahkan folder API Schema / Collection ke direktori `postman/`.
4. Setiap perubahan endpoint yang di-push ke GitHub akan otomatis ter-update di workspace Postman Anda!

---

### Cara 3: Menggunakan Backend Server Lokal
Saat tim backend Anda sudah menjalankan server lokal di port `8080`:
```env
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8080/api/v1
```
