# Panduan Integrasi Backend — ForgePro.id Panel Admin

Dokumen ini memetakan arsitektur integrasi antara klien frontend web panel admin ForgePro.id (Vite + React + TypeScript) dengan backend API yang akan dikembangkan.

---

## 1. Variabel Lingkungan Frontend (.env)

```env
# URL Base backend API (tanpa trailing slash)
VITE_API_URL=https://api.forgepro.id/v1

# Mode data contoh: 'true' untuk mode mock terpusat, 'false' untuk API backend nyata
VITE_USE_MOCK=false
```

---

## 2. Urutan Pembangunan Backend (Prioritas Sprint)

1. **Sprint 1: Autentikasi & Sesi Admin (Auth)**
   - `POST /auth/login` (email + password)
   - `POST /auth/2fa/verify` (TOTP 6 digit)
   - `POST /auth/logout` & `GET /auth/me`
   - Manajemen sesi 30 menit (HttpOnly Cookie + Header `X-CSRF-Token`).
   - Rate limiting: 5 kali gagal -> kunci akun 15 menit.

2. **Sprint 2: Pesanan & Google Play Billing RTDN**
   - `GET /orders` (filter status, paket, query, paginasi)
   - `GET /orders/{orderNumber}`
   - `POST /webhooks/google-play` (penerima callback Real-time Developer Notifications Google RTDN).
   - `POST /orders/{orderNumber}/verify-payment` (rekonsiliasi manual GPA).
   - `POST /orders/{orderNumber}/sync-refund` (Voided Purchases sync).

3. **Sprint 3: Worker Fal.ai FLUX & Antrean Render**
   - Integrasi Fal.ai (`fal-ai/flux-pro/v1.1`).
   - `GET /ai/jobs` & `POST /ai/jobs/{id}/retry`.
   - `POST /orders/{orderNumber}/rerender`.
   - Moderasi gambar & linter kata terlarang (Blacklist).

4. **Sprint 4: Kepatuhan Privasi Biometrik UU PDP No. 27/2022**
   - Cron Job / Scheduler: Penghapusan selfie mentah otomatis dalam 24 jam.
   - `GET /privacy/retention` & `POST /privacy/jobs/run`.
   - `POST /privacy/requests/{id}/approve` (Hak Hapus Data Pasal 39).
   - Pencatatan log audit privasi setiap unmasking data kontak.

5. **Sprint 5: Cetak Fisik & Payment Gateway**
   - Abstraksi `PaymentGateway` (Xendit / Midtrans) untuk biaya cetak & ongkir.
   - `GET /prints`, `POST /prints/{id}/tracking` (nomor resi kurir).
   - Integrasi API kurir resmi (JNE, J&T, SiCepat, Pos Indonesia).

6. **Sprint 6: Pengaturan, Webhook Eksternal & Notifikasi**
   - Modul pengaturan write-only untuk API secret keys.
   - Dispatcher webhook ke endpoint sistem eksternal dengan kebijakan retry eksponensial.
   - Template pesan email & WhatsApp.

---

## 3. Variabel Rahasia Sisi Server (Backend Environment)

Rahasia sistem **TIDAK PERNAH** dikirimkan atau disimpan di browser/frontend. Kunci ini dikelola langsung di server backend:

| Variabel Server | Deskripsi & Penyedia |
|---|---|
| `FAL_AI_API_KEY` | Kunci otentikasi worker render Fal.ai FLUX |
| `GOOGLE_APPLICATION_CREDENTIALS` | JSON Service Account untuk Google Play Developer API (RTDN & IAP) |
| `PAYMENT_GATEWAY_SECRET_KEY` | Kunci rahasia API Xendit / Midtrans untuk tagihan cetak fisik |
| `STORAGE_S3_ACCESS_KEY` & `SECRET` | Kunci bucket cloud storage (S3 / GCS) untuk arsip foto hasil render |
| `SMTP_HOST`, `USER`, `PASSWORD` | Kredensial server email transaksional |
| `COURIER_API_KEY` | Kunci akses API pelacakan ekspedisi kurir |

---

## 4. Standar Header & Keamanan API

- **Sesi HttpOnly Cookie**: Cookie sesi diamankan dengan flag `Secure`, `HttpOnly`, dan `SameSite=Strict`.
- **Proteksi CSRF**: Setiap mutasi (POST/PUT/PATCH/DELETE) menyertakan header `X-CSRF-Token`.
- **Idempotency Key**: Operasi sensitif (re-render AI, refund, buat link bayar) menyertakan header `Idempotency-Key` untuk mencegah duplikasi eksekusi.
- **Validasi Peran Server-Side**: Frontend menampilkan UI berdasarkan izin peran (*UX guidance*), namun otorisasi wajib divalidasi ulang di backend pada setiap pemanggilan endpoint (`403 Forbidden`).
