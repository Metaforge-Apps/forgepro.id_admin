import React, { useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { useCentralStore } from '../../mocks/selectors';
import { formatTanggalWIB } from '../../config/business';
import {
  Smartphone,
  AlertTriangle,
  Sliders,
  Bell,
} from 'lucide-react';

interface FlutterAppTabProps {
  onShowToast: (message: string, tone?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export function FlutterAppTab({ onShowToast }: FlutterAppTabProps) {
  const { updateState } = useCentralStore();

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    'ForgePro.id sedang dalam pemeliharaan sistem berkala. Layanan rendering AI akan segera aktif kembali dalam beberapa menit.'
  );

  const [minAppVersion, setMinAppVersion] = useState<string>('2.1.0');
  const [latestAppVersion, setLatestAppVersion] = useState<string>('2.4.2');
  const [forceUpdateEnabled, setForceUpdateEnabled] = useState<boolean>(true);

  const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(true);
  const [announcementText, setAnnouncementText] = useState<string>(
    'Promo Rilis 2026: Dapatkan potongan diskon 15% untuk semua paket jas AI dengan kode voucher FORGEPRO2026!'
  );
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'promo'>('promo');

  // Feature Flags
  const [flags, setFlags] = useState({
    enableCustomPromptInput: true,
    enableHighResZoomPreview: true,
    enableWhatsAppSupportButton: true,
  });

  const handleSaveAppConfig = () => {
    const nowWib = formatTanggalWIB(new Date().toISOString());
    updateState((prev) => ({
      ...prev,
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          time: nowWib,
          source: 'Admin Utama (Andi Prasetyo)',
          activity: `Pembaruan konfigurasi aplikasi Flutter (Min: ${minAppVersion}, Maintenance: ${maintenanceMode ? 'Aktif' : 'Nonaktif'})`,
          category: 'Pengaturan',
          result: 'Berhasil',
          targetId: 'Aplikasi Flutter',
        },
        ...prev.activityLogs,
      ],
    }));

    onShowToast('Konfigurasi aplikasi Flutter dan banner berhasil diperbarui.', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="font-semibold text-sm text-content-primary">
            Konfigurasi Klien Seluler (Flutter Mobile App)
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Kendali jarak jauh untuk versi aplikasi, mode pemeliharaan, banner pengumuman, dan feature flags.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAppConfig}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2C] text-[#F7F5F0] dark:bg-[#D9B06F] dark:text-[#0A111C] hover:opacity-95 transition-opacity"
        >
          Simpan Konfigurasi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Mode Pemeliharaan & Versi Minimum (6 Kolom) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card Maintenance Mode */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className={`w-4 h-4 ${maintenanceMode ? 'text-rose-500' : 'text-content-muted'}`} />
                <h4 className="font-semibold text-xs text-content-primary">Mode Pemeliharaan (Maintenance)</h4>
              </div>
              <StatusBadge
                status={maintenanceMode ? 'Sedang Aktif' : 'Nonaktif'}
                variant={maintenanceMode ? 'rose' : 'emerald'}
              />
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Jika diaktifkan, pengguna aplikasi Flutter akan melihat layar pemeliharaan dan tidak dapat membuat pesanan rendering AI baru sementara waktu.
            </p>

            <div className="flex items-center justify-between py-2 border-y border-border-subtle">
              <span className="text-xs font-semibold text-content-primary">Aktifkan Mode Pemeliharaan</span>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </div>

            {maintenanceMode && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-content-primary">Pesan Pemeliharaan untuk Pengguna</label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>
            )}
          </Card>

          {/* Card Versi Aplikasi & Paksa Update */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-[#D9B06F]" />
              <h4 className="font-semibold text-xs text-content-primary">Manajemen Versi Aplikasi & Paksa Update</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Versi Minimum Diizinkan</label>
                <input
                  type="text"
                  value={minAppVersion}
                  onChange={(e) => setMinAppVersion(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                />
                <span className="text-[10px] text-content-muted">Aplikasi di bawah versi ini wajib update</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Versi Terbaru Play Store</label>
                <input
                  type="text"
                  value={latestAppVersion}
                  onChange={(e) => setLatestAppVersion(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                />
                <span className="text-[10px] text-content-muted">Versi rilis terkini di Google Play</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
              <div>
                <span className="font-semibold text-content-primary block">Tampilkan Dialog Paksa Update</span>
                <span className="text-[11px] text-content-muted">Mengarahkan pengguna langsung ke Google Play Store</span>
              </div>
              <input
                type="checkbox"
                checked={forceUpdateEnabled}
                onChange={(e) => setForceUpdateEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#D9B06F] rounded"
              />
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: Banner Pengumuman & Feature Flags (6 Kolom) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card Banner Pengumuman */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#D9B06F]" />
                <h4 className="font-semibold text-xs text-content-primary">Banner Pengumuman Dalam Aplikasi</h4>
              </div>
              <StatusBadge status={announcementEnabled ? 'Tayang' : 'Mati'} variant={announcementEnabled ? 'emerald' : 'slate'} />
            </div>

            <div className="flex items-center justify-between py-2 border-y border-border-subtle text-xs">
              <span className="font-semibold text-content-primary">Tampilkan Banner di Beranda Aplikasi</span>
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#D9B06F] rounded"
              />
            </div>

            {announcementEnabled && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Teks Pengumuman</label>
                  <textarea
                    rows={2}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border-subtle bg-surface-card text-xs text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="font-semibold text-content-primary">Jenis Tampilan:</label>
                  <div className="flex items-center gap-2">
                    {(['promo', 'info', 'warning'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAnnouncementType(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${
                          announcementType === t
                            ? 'bg-[#D9B06F]/20 text-[#D9B06F] border-[#D9B06F]'
                            : 'bg-surface-card border-border-subtle text-content-muted'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Card Feature Flags */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <h4 className="font-semibold text-xs text-content-primary">Feature Flags (Aktifasi Fitur Dinamis)</h4>
            </div>

            <div className="divide-y divide-border-subtle/60 text-xs">
              <label className="py-2.5 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-content-primary block">Input Prompt Tambahan (Paket Pro & Eksklusif)</span>
                  <span className="text-[11px] text-content-muted">Mengizinkan pengguna mengetik preferensi jas kustom</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enableCustomPromptInput}
                  onChange={(e) => setFlags({ ...flags, enableCustomPromptInput: e.target.checked })}
                  className="w-4 h-4 accent-[#D9B06F] rounded"
                />
              </label>

              <label className="py-2.5 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-content-primary block">Pratinjau Zoom Resolusi Tinggi</span>
                  <span className="text-[11px] text-content-muted">Pinch-to-zoom galeri foto dengan perlindungan watermark</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enableHighResZoomPreview}
                  onChange={(e) => setFlags({ ...flags, enableHighResZoomPreview: e.target.checked })}
                  className="w-4 h-4 accent-[#D9B06F] rounded"
                />
              </label>

              <label className="py-2.5 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-content-primary block">Tombol Bantuan WhatsApp CS</span>
                  <span className="text-[11px] text-content-muted">Tampilkan floating button WhatsApp langsung ke CS</span>
                </div>
                <input
                  type="checkbox"
                  checked={flags.enableWhatsAppSupportButton}
                  onChange={(e) => setFlags({ ...flags, enableWhatsAppSupportButton: e.target.checked })}
                  className="w-4 h-4 accent-[#D9B06F] rounded"
                />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FlutterAppTab;
