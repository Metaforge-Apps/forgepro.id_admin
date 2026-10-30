import { BrandConfig } from '../types';

/**
 * Centralized Branding & Application Configuration — ForgePro.id
 * Ubah file ini untuk memperbarui nama aplikasi, logo, tagline, atau informasi admin
 * tanpa harus mengubah kode di komponen-komponen UI secara manual.
 */

export const BRAND_CONFIG: BrandConfig = {
  // Nama aplikasi & identitas proyek
  appName: 'ForgePro.id',
  appNamePrefix: 'ForgePro',
  appNameSuffix: 'id',
  tagline: 'AI PROFESSIONAL PHOTO APP',
  description: 'Platform Manajemen & Operasional Foto Profesional Berbasis AI — ForgePro.id',
  version: '1.0.0',

  // Referensi aset logo dan gambar
  logos: {
    // Logo horizontal (digunakan pada sidebar dan header)
    horizontal: '/images/logo-horizontal.png',
    // Logo badge bertumpuk (digunakan pada halaman login & favicon)
    badge: '/images/logo-transparent-vertikal.png',
    // Hero image halaman login (5 profesional berjas di kantor)
    loginHero: '/images/login-hero.png',
  },

  // Profil pengguna admin default (simulasi)
  defaultAdmin: {
    name: 'Admin Utama',
    email: 'admin@forgepro.id',
    avatarInitial: 'A',
    role: 'Super Admin',
  },

  // Konfigurasi tema default
  defaultTheme: 'dark', // 'dark' atau 'light'

  // Text subtitle & ringkasan di dashboard
  dashboard: {
    categoryLabel: 'RINGKASAN',
    title: 'Dashboard',
    subtitle: 'Aktivitas pesanan ForgePro.id 7 hari terakhir.',
  },

  // Teks di halaman Login
  login: {
    title: 'Login Sebagai Admin',
    subtitle: 'Gunakan akun admin yang sudah terdaftar.',
    emailLabel: 'Email',
    emailPlaceholder: 'admin@forgepro.id',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••••',
    submitButton: 'Masuk',
    submitLoading: 'Memverifikasi...',
  },

  // Teks umpan balik terpusat (Fase 0: 0.5, 0.8, 0.9)
  feedback: {
    savedSuccess: 'Perubahan berhasil disimpan.',
    cancelledReset: 'Perubahan dibatalkan. Data dikembalikan ke versi tersimpan.',
    saveErrorPrefix: 'Gagal menyimpan: ',
    retryButton: 'Coba lagi',
    dirtyBadge: 'Perubahan belum disimpan',
    unsavedNavigationTitle: 'Perubahan belum disimpan',
    unsavedNavigationMessage:
      'Anda memiliki perubahan yang belum disimpan. Jika meninggalkan halaman ini, seluruh perubahan yang belum disimpan akan hilang.',
    unsavedStayButton: 'Tetap di halaman',
    unsavedLeaveButton: 'Buang perubahan',
    demoModeBanner: 'Mode data contoh',
    demoModeTooltip:
      'Panel berjalan dengan basis data contoh lokal (VITE_USE_MOCK=true). Seluruh perubahan tersimpan di peramban.',
    resetDemoData: 'Reset data contoh',
    resetDemoSuccess: 'Data contoh berhasil dikembalikan ke kondisi awal.',
  },

  // Teks state kosong, error, dan konfirmasi umum (Fase 0: 0.4)
  commonStates: {
    emptyTitle: 'Belum ada data untuk ditampilkan',
    emptyDescription:
      'Sesuaikan kata kunci pencarian atau filter untuk menemukan data yang Anda cari.',
    errorTitle: 'Gagal memuat data',
    errorDescription:
      'Terjadi kendala saat mengambil data. Silakan periksa koneksi atau coba muat ulang.',
    confirmCancelLabel: 'Batalkan',
    confirmProceedLabel: 'Konfirmasi',
  },
};

export default BRAND_CONFIG;
