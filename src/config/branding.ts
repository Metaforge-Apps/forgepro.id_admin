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
};

export default BRAND_CONFIG;
