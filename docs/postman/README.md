# ForgePro.id — Koleksi Postman API Panel Admin

Dokumen ini memuat panduan penggunaan koleksi Postman resmi untuk pengujian dan integrasi backend panel admin **ForgePro.id**.

## Berkas Koleksi
- **Koleksi API**: `ForgePro-Admin.postman_collection.json` (Postman v2.1)

## Variabel Lingkungan (Environments)
Terdapat 3 environment yang disarankan untuk diimpor ke Postman:
1. **Local Development**:
   - `baseUrl`: `http://localhost:8000/api/v1`
   - `authToken`: (otomatis disimpan dari alur 2FA)
2. **Staging**:
   - `baseUrl`: `https://staging-api.forgepro.id/v1`
3. **Production**:
   - `baseUrl`: `https://api.forgepro.id/v1`

## Alur Autentikasi Admin (00 - Auth Flow)
1. **Step 1 - Login Kredensial** (`POST /auth/login`):
   - Mengirimkan `email` dan `password`.
   - Mengembalikan `tempSessionToken` (berlaku 5 menit).
2. **Step 2 - Verifikasi 2FA TOTP** (`POST /auth/2fa/verify`):
   - Mengirimkan `tempSessionToken` dan `totpCode` (6 digit).
   - Menghasilkan cookie sesi HttpOnly atau `authToken` (JWT) yang disimpan otomatis ke variabel Postman.
3. **Step 3 - Akses Endpoint Terproteksi**:
   - Sertakan header `Authorization: Bearer {{authToken}}` atau cookie credentials.
