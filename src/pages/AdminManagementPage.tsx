import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Shield,
  X
} from 'lucide-react';
import type { AdminMember } from '../types';

const INITIAL_ADMINS: AdminMember[] = [
  {
    id: 'adm-1',
    name: 'Andi Prasetyo',
    email: 'andi@forgepro.id',
    role: 'Admin Utama',
    access: 'Seluruh menu',
    status: 'Aktif',
    lastActive: '19 Okt, 16:20 WIB',
    actionLabel: 'Kelola',
  },
  {
    id: 'adm-2',
    name: 'Maya Lestari',
    email: 'maya@forgepro.id',
    role: 'Operasional',
    access: 'Pesanan & Transaksi Digital',
    status: 'Aktif',
    lastActive: '19 Okt, 16:05 WIB',
    actionLabel: 'Kelola',
  },
  {
    id: 'adm-3',
    name: 'Dimas Putra',
    email: 'dimas@forgepro.id',
    role: 'Produk',
    access: 'Katalog, paket & promo',
    status: 'Aktif',
    lastActive: '19 Okt, 15:42 WIB',
    actionLabel: 'Kelola',
  },
  {
    id: 'adm-4',
    name: 'Sinta Dewi',
    email: 'sinta@forgepro.id',
    role: 'Keuangan',
    access: 'Transaksi & ekspor',
    status: 'Aktif',
    lastActive: '19 Okt, 14:58 WIB',
    actionLabel: 'Kelola',
  },
  {
    id: 'adm-5',
    name: 'Raka Wijaya',
    email: 'raka@forgepro.id',
    role: 'Operasional',
    access: 'Pesanan & Transaksi Digital',
    status: 'Diundang',
    lastActive: 'Belum pernah masuk',
    actionLabel: 'Kirim ulang',
  },
  {
    id: 'adm-6',
    name: 'Laras Putri',
    email: 'laras@forgepro.id',
    role: 'Produk',
    access: 'Tidak ada akses',
    status: 'Nonaktif',
    lastActive: '12 Okt, 10:15 WIB',
    actionLabel: 'Kelola',
  },
];

const ROLE_ACCESS_MAP: Record<AdminMember['role'], string> = {
  'Admin Utama': 'Seluruh menu',
  Operasional: 'Pesanan & Transaksi Digital',
  Produk: 'Katalog, paket & promo',
  Keuangan: 'Transaksi & ekspor',
};

import { activityController } from '../controllers/activity-controller';

const STORAGE_KEY_ADMINS = 'forgepro_admins_v1';

export function AdminManagementPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminMember[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ADMINS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMINS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_ADMINS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
    } catch {
      // Ignore
    }
  }, [admins]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua peran');
  const [statusFilter, setStatusFilter] = useState<string>('Semua status');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showRolesModal, setShowRolesModal] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminMember | null>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<AdminMember['role']>('Operasional');

  // Listen to Header "Undang admin" button
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'invite-admin') {
        setShowInviteModal(true);
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  }, []);

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => a.status === 'Aktif').length;
    const pending = admins.filter((a) => a.status === 'Diundang').length;
    return { total, active, pending };
  }, [admins]);

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      if (roleFilter !== 'Semua peran' && a.role !== roleFilter) return false;
      if (statusFilter !== 'Semua status' && a.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = a.name.toLowerCase().includes(q);
        const matchEmail = a.email.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    });
  }, [admins, roleFilter, statusFilter, searchQuery]);

  const handleInviteAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    const newMember: AdminMember = {
      id: `adm-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      access: ROLE_ACCESS_MAP[inviteRole] || 'Pesanan & Transaksi Digital',
      status: 'Diundang',
      lastActive: 'Belum pernah masuk',
      actionLabel: 'Kirim ulang',
    };
    setAdmins((prev) => [...prev, newMember]);
    setShowInviteModal(false);
    activityController.logActivity({
      source: 'Admin Utama',
      category: 'Admin',
      activity: `Mengundang staf admin · ${newMember.email} (${newMember.role})`,
      result: 'Berhasil',
    });
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Operasional');
  };

  const getStatusBadgeStyle = (status: AdminMember['status']): string => {
    if (status === 'Aktif') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (status === 'Diundang') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Summary Stat Cards Sesuai Referensi Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Total admin
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.total}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Seluruh anggota tim
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Admin aktif
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.active}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Memiliki akses ke panel
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Undangan tertunda
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.pending}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Menunggu aktivasi akun
          </span>
        </Card>

        <Card padding="p-6" className="flex flex-col justify-between">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-medium text-content-muted">
              Autentikasi dua langkah
            </span>
            <span className="font-serif text-3xl lg:text-[32px] font-medium tracking-tight text-content-primary">
              {stats.active}/{stats.active}
            </span>
          </div>
          <span className="text-xs text-content-muted mt-4 block">
            Seluruh admin aktif terlindungi
          </span>
        </Card>
      </div>

      {/* Main Card: Anggota tim */}
      <Card padding="p-6 sm:p-7" className="flex flex-col gap-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-content-primary">
            Anggota tim
          </h2>

          <button
            type="button"
            onClick={() => setShowRolesModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors self-start sm:self-auto"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Kelola peran</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Cari nama atau email admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua peran">Semua peran</option>
                <option value="Admin Utama">Admin Utama</option>
                <option value="Operasional">Operasional</option>
                <option value="Produk">Produk</option>
                <option value="Keuangan">Keuangan</option>
              </select>
            </div>

            <div className="relative">
              <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-primary pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-surface-card border border-border-subtle text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
              >
                <option value="Semua status">Semua status</option>
                <option value="Aktif">Aktif</option>
                <option value="Diundang">Diundang</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 sm:-mx-7 px-6 sm:px-7">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[10px] uppercase">
                <th className="pb-3 pr-4">ADMIN</th>
                <th className="pb-3 px-4">PERAN</th>
                <th className="pb-3 px-4">AKSES</th>
                <th className="pb-3 px-4">STATUS</th>
                <th className="pb-3 px-4">AKTIVITAS TERAKHIR</th>
                <th className="pb-3 pl-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredAdmins.map((adm) => (
                <tr
                  key={adm.id}
                  onClick={() => setSelectedAdmin(adm)}
                  className="group hover:bg-surface-hover/40 transition-colors cursor-pointer"
                >
                  {/* ADMIN */}
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-content-primary">
                        {adm.name}
                      </span>
                      <span className="text-[11px] text-content-muted">
                        {adm.email}
                      </span>
                    </div>
                  </td>

                  {/* PERAN */}
                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {adm.role}
                  </td>

                  {/* AKSES */}
                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {adm.access}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                        adm.status
                      )}`}
                    >
                      {adm.status}
                    </span>
                  </td>

                  {/* AKTIVITAS TERAKHIR */}
                  <td className="py-4 px-4 text-content-muted whitespace-nowrap">
                    {adm.lastActive}
                  </td>

                  {/* AKSI */}
                  <td className="py-4 pl-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (adm.actionLabel === 'Kirim ulang') {
                          alert(`Undangan aktivasi dikirim ulang ke ${adm.email}.`);
                        } else {
                          setSelectedAdmin(adm);
                        }
                      }}
                      className="font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
                    >
                      <span>{adm.actionLabel}</span>
                      <span>&rarr;</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="pt-2 border-t border-border-subtle">
          <span className="text-xs text-content-muted">
            Menampilkan seluruh {filteredAdmins.length} admin · Akses hanya dapat
            diubah oleh Admin Utama.
          </span>
        </div>
      </Card>

      {/* 2 Bottom Cards: Kebijakan keamanan & Perubahan akses terakhir */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-content-primary">
                Kebijakan keamanan
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Aktif
              </span>
            </div>
            <p className="text-xs text-content-muted leading-relaxed">
              Autentikasi dua langkah wajib untuk seluruh admin. Sesi berakhir
              otomatis setelah 30 menit tanpa aktivitas.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => navigate('/pengaturan')}
              className="text-xs font-semibold text-content-primary hover:text-[#D9B06F] transition-colors inline-flex items-center gap-1"
            >
              <span>Atur keamanan</span>
              <span>&rarr;</span>
            </button>
          </div>
        </Card>

        <Card padding="p-6 sm:p-7" className="flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm sm:text-base font-semibold text-content-primary">
              Perubahan akses terakhir
            </h3>
            <p className="text-xs font-semibold text-content-primary">
              Andi Prasetyo mengundang Raka Wijaya sebagai Operasional.
            </p>
          </div>

          <div className="text-xs text-content-muted">
            <span>19 Okt 2026, 13:40 WIB · </span>
            <button
              type="button"
              onClick={() => navigate('/log-aktivitas')}
              className="text-content-muted hover:text-content-primary transition-colors inline-flex items-center gap-1"
            >
              <span>Lihat log aktivitas</span>
              <span>&rarr;</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Modal Undang Admin */}
      {showInviteModal && (
        <div
          onClick={() => setShowInviteModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Undang anggota tim
            </h3>
            <p className="text-xs text-content-muted mb-5">
              Kirimkan undangan akses ke panel admin ForgePro.id.
            </p>

            <form onSubmit={handleInviteAdmin} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Raka Wijaya"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Email kerja
                </label>
                <input
                  type="email"
                  placeholder="nama@forgepro.id"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">
                  Peran akses
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminMember['role'])}
                  className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] cursor-pointer"
                >
                  <option value="Operasional">
                    Operasional (Pesanan & Transaksi Digital)
                  </option>
                  <option value="Produk">
                    Produk (Katalog, paket & promo)
                  </option>
                  <option value="Keuangan">
                    Keuangan (Transaksi & ekspor)
                  </option>
                  <option value="Admin Utama">
                    Admin Utama (Seluruh menu)
                  </option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285]"
                >
                  Kirim undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Peran */}
      {showRolesModal && (
        <div
          onClick={() => setShowRolesModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowRolesModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              Daftar peran & akses
            </h3>
            <p className="text-xs text-content-muted mb-4">
              Cakupan hak akses menu untuk setiap peran di panel ForgePro.id.
            </p>

            <div className="divide-y divide-border-subtle text-xs">
              {Object.entries(ROLE_ACCESS_MAP).map(([roleName, accessDesc]) => (
                <div key={roleName} className="py-3 flex items-center justify-between">
                  <span className="font-semibold text-content-primary">
                    {roleName}
                  </span>
                  <span className="text-content-muted">{accessDesc}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowRolesModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kelola Anggota Tim */}
      {selectedAdmin && (
        <div
          onClick={() => setSelectedAdmin(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-border-card p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedAdmin(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium text-content-primary mb-1">
              {selectedAdmin.name}
            </h3>
            <p className="text-xs text-content-muted mb-5">
              {selectedAdmin.email} · {selectedAdmin.role}
            </p>

            <div className="space-y-3 text-xs border-t border-b border-border-subtle py-4">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Cakupan akses</span>
                <span className="font-semibold text-content-primary">
                  {selectedAdmin.access}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Status akun</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeStyle(
                    selectedAdmin.status
                  )}`}
                >
                  {selectedAdmin.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Aktivitas terakhir</span>
                <span className="text-content-primary">
                  {selectedAdmin.lastActive}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const nextStatus: AdminMember['status'] =
                    selectedAdmin.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
                  const nextAccess =
                    nextStatus === 'Nonaktif'
                      ? 'Tidak ada akses'
                      : ROLE_ACCESS_MAP[selectedAdmin.role] || 'Seluruh menu';
                  setAdmins((prev) =>
                    prev.map((a) =>
                      a.id === selectedAdmin.id
                        ? { ...a, status: nextStatus, access: nextAccess }
                        : a
                    )
                  );
                  setSelectedAdmin(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary"
              >
                {selectedAdmin.status === 'Aktif'
                  ? 'Nonaktifkan akses'
                  : 'Aktifkan kembali'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedAdmin(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagementPage;
