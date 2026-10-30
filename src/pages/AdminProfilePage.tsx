import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';
import { useBroadcastDirty } from '../components/common/DirtyGuard';
import type { SemanticFeedbackTone } from '../config/statusColors';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/branding';
import { NAVIGATION_SECTIONS } from '../config/navigation';
import { mockDb } from '../mocks/db';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Info,
  X
} from 'lucide-react';

const ADMIN_RECENT_ACTIVITIES = [
  {
    id: 'act-p1',
    time: '19 Okt, 16:20 WIB',
    module: 'Autentikasi',
    action: 'Masuk ke panel admin (Chrome • macOS)',
    status: 'Berhasil',
  },
  {
    id: 'act-p2',
    time: '19 Okt, 13:40 WIB',
    module: 'Manajemen Admin',
    action: 'Mengundang Raka Wijaya (raka@forgepro.id) sebagai Operasional',
    status: 'Berhasil',
  },
  {
    id: 'act-p3',
    time: '18 Okt, 19:15 WIB',
    module: 'Paket & Harga',
    action: 'Memperbarui visibilitas paket Profesional',
    status: 'Berhasil',
  },
  {
    id: 'act-p4',
    time: '17 Okt, 11:05 WIB',
    module: 'Voucher & Promo',
    action: 'Mengaktifkan kode promo KARIRHEMAT',
    status: 'Berhasil',
  },
];

const ACCESS_MODULES = [
  {
    group: 'Operasional',
    desc: 'Dashboard, Pesanan & Transaksi, Cetak Fisik & Pengiriman',
    level: 'Baca & Kelola',
  },
  {
    group: 'Katalog & Produk',
    desc: 'Katalog Gaya Jas, Paket & Harga, Voucher & Promo',
    level: 'Baca & Kelola',
  },
  {
    group: 'Sistem & Keamanan',
    desc: 'Manajemen Admin, Log Aktivitas & Webhook, Pengaturan',
    level: 'Admin Utama',
  },
];

export function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState<string>(
    user?.name || BRAND_CONFIG.defaultAdmin.name
  );
  const [fullName, setFullName] = useState<string>('Andi Prasetyo');
  const [primaryEmail, setPrimaryEmail] = useState<string>('andi@forgepro.id');
  const [loginEmail, setLoginEmail] = useState<string>(
    user?.email || 'admin@forgepro.id'
  );
  const [phone, setPhone] = useState<string>('+62 812-3456-7890');
  const [position, setPosition] = useState<string>('Admin Utama · ForgePro.id Admin');
  const [locationCity, setLocationCity] = useState<string>('Jakarta Selatan, Indonesia');
  const [timezone, setTimezone] = useState<string>('WIB (UTC+7)');

  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVariant, setToastVariant] = useState<SemanticFeedbackTone>('success');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  // Versi tersimpan: acuan untuk deteksi perubahan & pembatalan (Fase 0: 0.9)
  const [savedProfile, setSavedProfile] = useState({
    displayName: user?.name || BRAND_CONFIG.defaultAdmin.name,
    fullName: 'Andi Prasetyo',
    primaryEmail: 'andi@forgepro.id',
    loginEmail: user?.email || 'admin@forgepro.id',
    phone: '+62 812-3456-7890',
    position: 'Admin Utama · ForgePro.id Admin',
    locationCity: 'Jakarta Selatan, Indonesia',
    timezone: 'WIB (UTC+7)',
  });
  const currentProfile = {
    displayName,
    fullName,
    primaryEmail,
    loginEmail,
    phone,
    position,
    locationCity,
    timezone,
  };
  const isDirty = JSON.stringify(savedProfile) !== JSON.stringify(currentProfile);
  useBroadcastDirty(isDirty);

  const totalAccessibleMenus = useMemo(() => {
    return NAVIGATION_SECTIONS.reduce((acc, sec) => acc + sec.items.length, 0);
  }, []);

  const adminSessions = useMemo(() => {
    return mockDb.getState().adminSessions || [];
  }, []);

  const activeSessionsCount = adminSessions.length;
  const currentDeviceLabel =
    adminSessions.find((s) => s.isCurrent)?.deviceLabel || 'Chrome • macOS (Jakarta)';

  const latestActivity = useMemo(() => {
    const logs = mockDb.getState().activityLogs || [];
    return logs.find((l) => l.source === 'Admin Utama') || logs[0] || null;
  }, []);

  const showToast = (msg: string, variant: SemanticFeedbackTone = 'success') => {
    setToastMessage(msg);
    setToastVariant(variant);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSaveProfile = () => {
    if (!isDirty) return;
    if (updateProfile) {
      updateProfile({
        name: displayName.trim() || 'Admin Utama',
        email: loginEmail.trim() || 'admin@forgepro.id',
      });
    }
    setSavedProfile(currentProfile);
    showToast('Profil Admin Utama berhasil diperbarui.', 'success');
  };

  const handleResetProfile = () => {
    if (!isDirty) return;
    setDisplayName(savedProfile.displayName);
    setFullName(savedProfile.fullName);
    setPrimaryEmail(savedProfile.primaryEmail);
    setLoginEmail(savedProfile.loginEmail);
    setPhone(savedProfile.phone);
    setPosition(savedProfile.position);
    setLocationCity(savedProfile.locationCity);
    setTimezone(savedProfile.timezone);
    // Pembatalan memakai warna merah sesuai aturan umpan balik (Fase 0: 0.5)
    showToast(BRAND_CONFIG.feedback.cancelledReset, 'danger');
  };

  // Listen to Header "Batalkan" & "Simpan profil" buttons
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'profile-save') {
        handleSaveProfile();
      } else if (customEvent.detail === 'profile-cancel') {
        handleResetProfile();
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  });

  const avatarInitial = (displayName || 'A').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback Toast Banner */}
      {toastMessage && (
        <Alert
          variant={toastVariant}
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Top Profile Identity Card */}
      <Card padding="p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-full bg-[#111A2C] border-2 border-[#D9B06F] flex items-center justify-center font-serif text-2xl font-semibold text-[#D9B06F] shrink-0 shadow-md">
              {avatarInitial}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-2xl font-medium text-content-primary tracking-tight">
                  {fullName}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/15 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                  {displayName}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Aktif
                </span>
              </div>

              <p className="text-xs text-content-muted">
                {primaryEmail} · {position}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ubah kata sandi</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/manajemen-admin')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Manajemen tim</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Peran &amp; akses
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              Penuh
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Seluruh {totalAccessibleMenus} menu panel admin
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Autentikasi dua langkah
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              Aktif
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Aplikasi autentikator TOTP
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Sesi perangkat aktif
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {activeSessionsCount} sesi
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block truncate" title={currentDeviceLabel}>
            {currentDeviceLabel}
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Aktivitas terakhir
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {latestActivity ? latestActivity.time.split(',')[1]?.trim().split(' ')[0] || '16:20' : '16:20'}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            {latestActivity ? latestActivity.time : '19 Oktober 2026 · WIB'}
          </span>
        </Card>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* KOLOM KIRI (7 Kolom) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Card 1: Informasi Profil Admin Utama */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-content-primary">
                Informasi identitas admin
              </h3>
              <span className="text-xs text-content-muted">
                ID: ADM-001
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Label tampilan sidebar
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Email utama
                </label>
                <input
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Email kredensial sistem
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Jabatan &amp; peran
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Lokasi operasional
                </label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Zona waktu
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetProfile}
                disabled={!isDirty}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={!isDirty}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan perubahan profil
              </button>
            </div>
          </Card>

          {/* Card 2: Riwayat Aktivitas Admin Utama */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-content-primary">
                Aktivitas terakhir Anda
              </h3>
              <span className="text-xs text-content-muted">
                Zona waktu WIB
              </span>
            </div>

            <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                    <th className="pb-3 pr-4">WAKTU</th>
                    <th className="pb-3 px-4">MODUL</th>
                    <th className="pb-3 px-4">AKTIVITAS</th>
                    <th className="pb-3 pl-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/60">
                  {ADMIN_RECENT_ACTIVITIES.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-hover/40 transition-colors"
                    >
                      <td className="py-3.5 pr-4 text-content-muted whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-content-primary whitespace-nowrap">
                        {item.module}
                      </td>
                      <td className="py-3.5 px-4 text-content-muted">
                        {item.action}
                      </td>
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => navigate('/log-aktivitas')}
                className="text-xs font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
              >
                <span>Lihat seluruh log aktivitas</span>
                <span>&rarr;</span>
              </button>
            </div>
          </Card>
        </div>

        {/* KOLOM KANAN (5 Kolom) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Card 1: Cakupan Hak Akses */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-content-primary">
                Hak akses peran
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Seluruh menu
              </span>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Sebagai Admin Utama, akun Anda memiliki wewenang penuh untuk
              mengelola operasional, katalog produk, anggota tim, serta
              konfigurasi sistem.
            </p>

            <div className="divide-y divide-border-subtle/60 text-xs">
              {ACCESS_MODULES.map((mod) => (
                <div
                  key={mod.group}
                  className="py-3 first:pt-1 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-content-primary">
                      {mod.group}
                    </span>
                    <span className="text-[11px] font-semibold text-[#D9B06F]">
                      {mod.level}
                    </span>
                  </div>
                  <span className="text-content-muted">{mod.desc}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Card 2: Keamanan & Sesi Aktif */}
          <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-content-primary">
              Keamanan &amp; sesi login
            </h3>

            <div className="divide-y divide-border-subtle/60 text-xs">
              <div className="pb-3 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary">
                    Autentikasi dua langkah (2FA)
                  </span>
                  <span className="text-content-muted">
                    Wajib untuk seluruh akun Admin Utama
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Aktif
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary">
                    Perangkat saat ini
                  </span>
                  <span className="text-content-muted">
                    Chrome • macOS · Jakarta, Indonesia
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                  Sesi ini
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-content-muted">Batas sesi otomatis</span>
                <span className="font-semibold text-content-primary">
                  30 menit tanpa aktivitas
                </span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/pengaturan')}
                className="text-xs font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
              >
                <span>Buka pengaturan keamanan lengkap</span>
                <span>&rarr;</span>
              </button>
            </div>
          </Card>

          {/* Info Notice */}
          <div className="flex items-start gap-2.5 px-1">
            <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-content-primary">
                Akun utama terlindungi
              </span>
              <p className="text-xs text-content-muted leading-relaxed">
                Perubahan pada nama tampilan akan langsung diperbarui pada kartu
                profil di sidebar kiri.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ubah Kata Sandi */}
      {showPasswordModal && (
        <div
          onClick={() => setShowPasswordModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Ubah kata sandi
            </h3>
            <p className="text-xs text-content-muted mb-5">
              Perbarui kata sandi untuk akun {primaryEmail}.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowPasswordModal(false);
                showToast('Kata sandi Admin Utama berhasil diperbarui.');
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Kata sandi saat ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Kata sandi baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 12 karakter"
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
                >
                  Simpan kata sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfilePage;
