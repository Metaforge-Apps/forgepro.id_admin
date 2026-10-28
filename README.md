# ForgePro.id — Admin Dashboard & Portal (TypeScript Edition)

Aplikasi web admin page profesional berbasis **React 19**, **TypeScript**, **Vite**, dan **Tailwind CSS** untuk **ForgePro.id (AI Professional Photo App)**. Dibuat dengan presisi tinggi mengikuti referensi desain Figma, mendukung fitur **Dark Mode** dan **Light Mode** secara menyeluruh, serta arsitektur **Controller berbasis TypeScript (`style-controller` & `package-controller`)** dengan konfigurasi branding terpusat.

> **Status: demo untuk review.** Autentikasi masih simulasi di sisi browser dan bukan perlindungan akses. Jangan gunakan data nyata atau mengandalkan login untuk mengamankan aplikasi ini. Siapa pun yang membuka demo dapat masuk menggunakan kredensial demo di bawah.

---

## 🚀 Fitur Utama

- **Arsitektur TypeScript Menyeluruh (`.ts` / `.tsx`)**:
  - Konfigurasi strict TypeScript (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`) serta definisi tipe terpusat di `src/types/index.ts`.
  - Modul **`style-controller`** (`src/controllers/style-controller/`) dan **`package-controller`** (`src/controllers/package-controller/`) yang mengelola state, pencarian, filter, validasi, urutan tampil, arsip, serta persistensi `localStorage` untuk Katalog Gaya Jas dan Paket & Harga.
- **Desain Presisi Sesuai Figma**:
  - Halaman **Login** split-screen dengan hero image tim profesional, badge logo vertikal ForgePro.id, formulir email & password dengan toggle 'Tampilkan/Sembunyikan', validasi form, dan state loading.
  - Halaman **Dashboard** dengan ringkasan metrik (Total Transaksi, Pendapatan, Pesanan Berhasil, Pending & Gagal), grafik kurva pendapatan emas interaktif (filter Hari, Minggu, Bulan), progress bar paket terlaris, dan tabel transaksi terkini dengan modal detail.
- **Dukungan Penuh Dark & Light Mode**:
  - Dark Mode: Background utama `#0A111C`, kartu `#152238`, sidebar `#10192A`, teks `#F7F5F0`, aksen `#D9B06F`.
  - Light Mode: Background utama `#E2E8F0`, kartu `#FFFFFF`, sidebar `#FFFFFF`, teks `#0A111C`, border bersih.
  - Preferensi tema tersimpan otomatis di `localStorage` (`forgepro_theme`).
- **Branding Terpusat (ForgePro.id)**:
  - Seluruh identitas (nama aplikasi, tagline, aset logo, warna, akun demo) dikelola dalam satu file konfigurasi (`src/config/branding.ts`).

---

## 📁 Struktur Folder Project

```text
ForgePro.id/
├── public/
│   ├── images/
│   │   ├── login-hero.jpg                 # Foto hero tim 5 profesional
│   │   ├── logo-badge.png                 # Logo emblem vertikal ForgePro.id
│   │   ├── logo-transparent-vertikal.png  # Logo transparan vertikal ForgePro.id
│   │   └── logo-horizontal.png            # Logo horizontal transparan ForgePro.id
│   └── favicon.ico
├── src/
│   ├── controllers/
│   │   ├── style-controller/              # 🎯 Controller Katalog Gaya Jas (TypeScript)
│   │   │   ├── style.types.ts
│   │   │   ├── style.controller.ts
│   │   │   ├── useStyleController.ts
│   │   │   └── index.ts
│   │   ├── package-controller/            # 🎯 Controller Paket & Harga (TypeScript)
│   │   │   ├── package.types.ts
│   │   │   ├── package.controller.ts
│   │   │   ├── usePackageController.ts
│   │   │   └── index.ts
│   │   ├── style-controller.ts
│   │   ├── package-controller.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx                  # Status badge (Dibayar, Menunggu, Diproses, Gagal)
│   │   │   ├── Button.tsx                 # Tombol reusable (Primary gold, Dark border, Outline)
│   │   │   ├── Card.tsx                   # Kartu kontainer bergaya Figma
│   │   │   ├── Input.tsx                  # Input teks standar dengan label & error
│   │   │   ├── Logo.tsx                   # Komponen logo fleksibel dengan fallback SVG
│   │   │   ├── PasswordInput.tsx          # Input password + toggle Tampilkan/Sembunyikan
│   │   │   └── ThemeToggle.tsx            # Tombol toggle pill [ ☼ Dark ] / [ ☾ Light ]
│   │   └── dashboard/
│   │       ├── Header.tsx                 # Header ringkasan, theme toggle, aksi cepat
│   │       ├── RecentTransactionsTable.tsx # Tabel riwayat transaksi + modal detail
│   │       ├── RevenueChart.tsx           # Kurva SVG interaktif dengan gradient emas
│   │       ├── Sidebar.tsx                # Navigasi samping (desktop & mobile drawer)
│   │       ├── SidebarItem.tsx            # NavLink item menu
│   │       ├── StatCard.tsx               # Kartu statistik ringkasan
│   │       └── TopPackages.tsx            # Progress bar paket terlaris
│   ├── config/
│   │   ├── branding.ts                    # 🎯 Pusat pengaturan nama aplikasi, logo & teks
│   │   └── navigation.ts                  # Struktur menu sidebar
│   ├── context/
│   │   ├── AuthContext.tsx                # Logika simulasi autentikasi & sesi pengguna
│   │   └── ThemeContext.tsx               # Pengelola tema Dark/Light & persistensi
│   ├── layouts/
│   │   └── DashboardLayout.tsx            # Shell layout sidebar + header + content
│   ├── pages/
│   │   ├── LoginPage.tsx                  # Halaman login split-screen
│   │   ├── DashboardPage.tsx              # Tampilan halaman utama dashboard
│   │   ├── OrdersPage.tsx                 # Halaman Pesanan & Transaksi
│   │   ├── PrintingShippingPage.tsx       # Halaman Cetak Fisik & Pengiriman
│   │   ├── SuitCatalogPage.tsx            # Halaman Katalog Gaya Jas (via style-controller)
│   │   ├── AddSuitPage.tsx                # Halaman Tambah Gaya Jas (via style-controller)
│   │   ├── EditSuitPage.tsx               # Halaman Edit Gaya Jas (via style-controller)
│   │   ├── PricingPackagesPage.tsx        # Halaman Paket & Harga (via package-controller)
│   │   ├── AddPackagePage.tsx             # Halaman Tambah Paket (via package-controller)
│   │   ├── EditPackagePage.tsx            # Halaman Edit Paket (via package-controller)
│   │   ├── VouchersPage.tsx               # Halaman Voucher & Promo
│   │   ├── AdminManagementPage.tsx        # Halaman Manajemen Admin
│   │   ├── ActivityLogsPage.tsx           # Halaman Log Aktivitas & Webhook
│   │   ├── SettingsPage.tsx               # Halaman Pengaturan 5 Tab
│   │   ├── AdminProfilePage.tsx           # Halaman Profil Admin Utama
│   │   ├── NotFoundPage.tsx               # 404 handler
│   │   └── PlaceholderPage.tsx            # Template halaman sub-menu dalam pengembangan
│   ├── styles/
│   │   ├── index.css                      # Tailwind directives & global styling
│   │   └── theme.css                      # CSS Variables Design Tokens (Light/Dark)
│   ├── types/
│   │   └── index.ts                       # Tipe data global TypeScript
│   ├── vite-env.d.ts                      # Vite TypeScript environment declarations
│   ├── App.tsx                            # Route configuration (React Router)
│   └── main.tsx                           # Entry point aplikasi TypeScript
├── index.html                             # HTML root dengan font Playfair Display & Inter
├── tsconfig.json                          # Root TypeScript configuration
├── tsconfig.app.json                      # Application TypeScript configuration
├── tsconfig.node.json                     # Node/Vite TypeScript configuration
├── vite.config.ts                         # Konfigurasi Vite berbasis TypeScript
├── tailwind.config.js                     # Pemetaan token tema Tailwind CSS
└── package.json
```

---

## 🛠️ Instalasi & Menjalankan Project

### 1. Masuk ke Direktori Project
```bash
cd ForgePro.id
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Jalankan Pemeriksaan Tipe (TypeScript Check)
```bash
npm run typecheck
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di alamat: `http://localhost:5173/`

### 5. Build untuk Production
```bash
npm run build
```
File build yang optimal siap didistribusikan di folder `dist/`.

---

## 🔑 Akun Demo Login

Untuk mempermudah pengujian alur autentikasi dan masuk ke dashboard:
- **Email**: `admin@forgepro.id`
- **Password**: `admin123`
