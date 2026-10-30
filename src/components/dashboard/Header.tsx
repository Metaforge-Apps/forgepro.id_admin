import React, { useState, useEffect } from 'react';
import {
  Menu,
  Download,
  Printer,
  Plus,
  RotateCcw,
  UserPlus,
  Check,
  Search,
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useLocation, Link } from 'react-router-dom';
import { isMockMode } from '../../config/business';
import { BRAND_CONFIG } from '../../config/branding';
import { DIRTY_STATE_EVENT } from '../common/DirtyGuard';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationBell } from './NotificationBell';

/** Halaman yang memakai tombol Simpan di header dan mengikuti status "dirty". */
const DIRTY_AWARE_PATHS = ['/pengaturan', '/profil'];

export interface PageActionConfig {
  label: string;
  icon?: 'Download' | 'Printer' | 'Plus' | 'RotateCcw' | 'UserPlus' | 'Check';
  href?: string;
  isPrimary?: boolean;
  onClick?: () => void;
}

export interface PageHeaderConfig {
  category: string;
  title: string;
  subtitle: string;
  showSearch: boolean;
  actions: PageActionConfig[];
}

export type DashboardPeriodKey = 'Hari' | 'Minggu' | 'Bulan';

interface PeriodMeta {
  prefix: string;
  label: string;
  subtitle: string;
}

const PAGE_CONFIGS: Record<string, PageHeaderConfig> = {
  '/dashboard': {
    category: 'RINGKASAN',
    title: 'Dashboard',
    subtitle: 'Aktivitas pesanan ForgePro.id 7 hari terakhir.',
    showSearch: false,
    actions: [],
  },
  '/pesanan': {
    category: 'OPERASIONAL',
    title: 'Pesanan & Transaksi',
    subtitle: 'Pantau pembayaran dan proses foto AI dalam satu tempat.',
    showSearch: false,
    actions: [
      {
        label: 'Ekspor data',
        icon: 'Download',
        onClick: () => alert('Mengekspor data pesanan ke Excel/CSV...'),
      },
    ],
  },
  '/cetak-pengiriman': {
    category: 'OPERASIONAL',
    title: 'Cetak Fisik & Pengiriman',
    subtitle: 'Kelola produksi cetak hingga foto tiba di tangan pelanggan.',
    showSearch: false,
    actions: [
      {
        label: 'Cetak label',
        icon: 'Printer',
        onClick: () => alert('Membuka antrean pencetakan label thermal...'),
      },
    ],
  },
  '/katalog-jas': {
    category: 'KATALOG & PRODUK',
    title: 'Katalog Gaya Jas',
    subtitle: 'Atur pilihan gaya jas yang tersedia untuk produk foto AI.',
    showSearch: true,
    actions: [
      {
        label: 'Tambah gaya',
        icon: 'Plus',
        href: '/katalog-jas/tambah',
        isPrimary: true,
      },
    ],
  },
  '/katalog-jas/tambah': {
    category: 'KATALOG & PRODUK',
    title: 'Katalog Gaya Jas',
    subtitle: 'Atur pilihan gaya jas yang tersedia untuk produk foto AI.',
    showSearch: true,
    actions: [],
  },
  '/katalog-jas/edit': {
    category: 'KATALOG & PRODUK',
    title: 'Katalog Gaya Jas',
    subtitle: 'Atur pilihan gaya jas yang tersedia untuk produk foto AI.',
    showSearch: true,
    actions: [],
  },
  '/paket-harga': {
    category: 'KATALOG & PRODUK',
    title: 'Paket & Harga',
    subtitle: 'Kelola manfaat dan visibilitas paket foto profesional ForgePro.id.',
    showSearch: true,
    actions: [
      {
        label: 'Riwayat perubahan',
        icon: 'RotateCcw',
        onClick: () =>
          alert('Riwayat perubahan paket: Terakhir disesuaikan oleh Admin Utama.'),
      },
      {
        label: 'Tambah paket',
        icon: 'Plus',
        href: '/paket-harga/tambah',
        isPrimary: true,
      },
    ],
  },
  '/paket-harga/tambah': {
    category: 'KATALOG & PRODUK',
    title: 'Paket & Harga',
    subtitle: 'Kelola manfaat dan visibilitas paket foto profesional ForgePro.id.',
    showSearch: true,
    actions: [],
  },
  '/paket-harga/edit': {
    category: 'KATALOG & PRODUK',
    title: 'Paket & Harga',
    subtitle: 'Kelola manfaat dan visibilitas paket foto profesional ForgePro.id.',
    showSearch: true,
    actions: [],
  },
  '/voucher-promo': {
    category: 'KATALOG & PRODUK',
    title: 'Voucher & Promo',
    subtitle: 'Kelola kode promo, periode kampanye, dan penggunaan voucher.',
    showSearch: true,
    actions: [
      {
        label: 'Buat voucher',
        icon: 'Plus',
        isPrimary: true,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'create-voucher' })
          ),
      },
    ],
  },
  '/manajemen-admin': {
    category: 'SISTEM',
    title: 'Manajemen Admin',
    subtitle: 'Atur anggota tim, peran, dan akses ke panel admin ForgePro.id.',
    showSearch: true,
    actions: [
      {
        label: 'Undang admin',
        icon: 'UserPlus',
        isPrimary: true,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'invite-admin' })
          ),
      },
    ],
  },
  '/log-aktivitas': {
    category: 'SISTEM',
    title: 'Log Aktivitas & Webhook',
    subtitle: 'Telusuri perubahan admin dan pantau pengiriman event sistem.',
    showSearch: true,
    actions: [
      {
        label: 'Ekspor log',
        icon: 'Download',
        isPrimary: false,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'export-logs' })
          ),
      },
    ],
  },
  '/pengaturan': {
    category: 'SISTEM',
    title: 'Pengaturan',
    subtitle: 'Kelola identitas bisnis, akun admin, dan preferensi operasional.',
    showSearch: true,
    actions: [
      {
        label: 'Batalkan',
        isPrimary: false,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'settings-cancel' })
          ),
      },
      {
        label: 'Simpan perubahan',
        icon: 'Check',
        isPrimary: true,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'settings-save' })
          ),
      },
    ],
  },
  '/profil': {
    category: 'AKUN & KEAMANAN',
    title: 'Profil Admin Utama',
    subtitle:
      'Kelola identitas akun, kredensial masuk, dan riwayat aktivitas Admin Utama.',
    showSearch: false,
    actions: [
      {
        label: 'Batalkan',
        isPrimary: false,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'profile-cancel' })
          ),
      },
      {
        label: 'Simpan profil',
        icon: 'Check',
        isPrimary: true,
        onClick: () =>
          window.dispatchEvent(
            new CustomEvent('forgepro-action', { detail: 'profile-save' })
          ),
      },
    ],
  },
};

const DASHBOARD_PERIOD_META: Record<DashboardPeriodKey, PeriodMeta> = {
  Hari: {
    prefix: '1 hari',
    label: 'Hari ini',
    subtitle: 'Aktivitas pesanan ForgePro.id hari ini.',
  },
  Minggu: {
    prefix: '7 hari',
    label: 'Minggu ini',
    subtitle: 'Aktivitas pesanan ForgePro.id 7 hari terakhir.',
  },
  Bulan: {
    prefix: '30 hari',
    label: 'Bulan ini',
    subtitle: 'Aktivitas pesanan ForgePro.id 30 hari terakhir.',
  },
};

export interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [dashboardPeriod, setDashboardPeriod] = useState<DashboardPeriodKey>('Minggu');

  // Shortcut Ctrl+K / Cmd+K untuk Global Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDashboard = location.pathname === '/dashboard';
  const isDirtyAwarePage = DIRTY_AWARE_PATHS.includes(location.pathname);
  const [isPageDirty, setIsPageDirty] = useState<boolean>(false);

  // Status "perubahan belum disimpan" disiarkan oleh halaman aktif (Fase 0: 0.9)
  useEffect(() => {
    setIsPageDirty(false);
    const handleDirty = (e: Event) => {
      setIsPageDirty(Boolean((e as CustomEvent<boolean>).detail));
    };
    window.addEventListener(DIRTY_STATE_EVENT, handleDirty);
    return () => window.removeEventListener(DIRTY_STATE_EVENT, handleDirty);
  }, [location.pathname]);
  const currentConfig =
    PAGE_CONFIGS[location.pathname] || PAGE_CONFIGS['/dashboard'];

  // Sinkronisasi pill periode di header dengan tab Tren Pendapatan (Hari / Minggu / Bulan)
  useEffect(() => {
    const handlePeriodChange = (e: Event) => {
      const customEvent = e as CustomEvent<DashboardPeriodKey>;
      if (customEvent.detail && DASHBOARD_PERIOD_META[customEvent.detail]) {
        setDashboardPeriod(customEvent.detail);
      }
    };
    window.addEventListener('forgepro-period-change', handlePeriodChange);
    return () =>
      window.removeEventListener('forgepro-period-change', handlePeriodChange);
  }, []);

  const periodMeta =
    DASHBOARD_PERIOD_META[dashboardPeriod] || DASHBOARD_PERIOD_META.Minggu;

  return (
    <header className="flex flex-col gap-4 mb-8">
      {/* Tombol Hamburger Menu untuk layar Mobile */}
      <div className="flex items-center lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-hover border border-border-subtle"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Category (termasuk — RINGKASAN pada Dashboard), Title, Subtitle, dan Tombol Header */}
      <div>
        {currentConfig.category && (
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#D9B06F]" />
              <span className="text-[11px] font-medium tracking-[0.1em] text-[#8A94A8] uppercase">
                {currentConfig.category}
              </span>
            </div>

            {isMockMode() && (
              <span
                title={BRAND_CONFIG.feedback.demoModeTooltip}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/30 select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9B06F]" />
                <span>{BRAND_CONFIG.feedback.demoModeBanner}</span>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-[44px] md:text-[44px] font-medium text-[#111A2C] dark:text-[#F7F5F0] tracking-tight leading-tight">
              {currentConfig.title}
            </h1>
            <p className="text-sm text-content-muted mt-1.5">
              {isDashboard ? periodMeta.subtitle : currentConfig.subtitle}
            </p>
          </div>

          {/* Sisi Kanan Header: Quick Search (Ctrl+K), Notifikasi, ThemeToggle, Pill Periode / Action Buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            {/* Tombol Pencarian Cepat Global (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-surface-card border border-border-subtle text-content-muted hover:text-content-primary hover:border-border-card transition-colors select-none"
              title="Pencarian Global (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#D9B06F]" />
              <span className="hidden md:inline">Cari data...</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-hover border border-border-subtle text-content-muted">
                Ctrl K
              </kbd>
            </button>

            {/* Pusat Notifikasi Lonceng */}
            <NotificationBell />

            <ThemeToggle />

            {isDirtyAwarePage && isPageDirty && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{BRAND_CONFIG.feedback.dirtyBadge}</span>
              </span>
            )}

            {isDashboard && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111A2C] border border-[#D9B06F] text-xs select-none shadow-sm">
                <span className="text-[#CBD5E1] font-normal">
                  {periodMeta.prefix}
                </span>
                <span className="text-[#F7F5F0] font-semibold">
                  {periodMeta.label}
                </span>
              </div>
            )}

            {!isDashboard &&
              currentConfig.actions &&
              currentConfig.actions.length > 0 &&
              currentConfig.actions.map((act, idx) => {
                const btnStyle = act.isPrimary
                  ? 'bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:bg-[#1A2844] dark:hover:bg-[#E5C285] border border-transparent'
                  : 'bg-surface-card hover:bg-surface-hover text-content-primary border border-border-subtle';

                if (act.href) {
                  return (
                    <Link
                      key={idx}
                      to={act.href}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm select-none disabled:opacity-50 disabled:cursor-not-allowed ${btnStyle}`}
                    >
                      {act.icon === 'Plus' && <Plus className="w-4 h-4" />}
                      <span>{act.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={act.onClick}
                    disabled={isDirtyAwarePage && !isPageDirty}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm select-none disabled:opacity-50 disabled:cursor-not-allowed ${btnStyle}`}
                  >
                    {act.icon === 'Download' && (
                      <Download className="w-4 h-4" />
                    )}
                    {act.icon === 'Printer' && <Printer className="w-4 h-4" />}
                    {act.icon === 'RotateCcw' && (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    {act.icon === 'Plus' && (
                      <Plus
                        className={`w-4 h-4 ${
                          act.isPrimary
                            ? 'text-[#D9B06F] dark:text-[#0A111C]'
                            : ''
                        }`}
                      />
                    )}
                    {act.icon === 'UserPlus' && (
                      <UserPlus
                        className={`w-4 h-4 ${
                          act.isPrimary
                            ? 'text-[#D9B06F] dark:text-[#0A111C]'
                            : ''
                        }`}
                      />
                    )}
                    {act.icon === 'Check' && (
                      <Check
                        className={`w-4 h-4 ${
                          act.isPrimary
                            ? 'text-[#D9B06F] dark:text-[#0A111C]'
                            : ''
                        }`}
                      />
                    )}
                    <span>{act.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}

export default Header;
