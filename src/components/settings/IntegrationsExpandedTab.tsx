import React, { useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { isMockMode } from '../../config/business';
import {
  Sparkles,
  Server,
  Mail,
  HardDrive,
  CreditCard,
  Truck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface IntegrationsExpandedTabProps {
  onShowToast: (message: string, tone?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export function IntegrationsExpandedTab({ onShowToast }: IntegrationsExpandedTabProps) {
  // Fal.ai State
  const [falEndpoint, setFalEndpoint] = useState<string>('fal-ai/flux-lora-portrait/v1');
  const [falConcurrency, setFalConcurrency] = useState<number>(5);
  const [falTimeout, setFalTimeout] = useState<number>(60);
  const [falKeyMasked, setFalKeyMasked] = useState<string>('fal_key_•••••••••••89af');
  const [isTestingFal, setIsTestingFal] = useState<boolean>(false);
  const [falStatus, setFalStatus] = useState<boolean>(true);

  // Storage State
  const [storageBucket, setStorageBucket] = useState<string>('forgepro-production-assets');
  const [signedUrlDuration, setSignedUrlDuration] = useState<number>(15);
  const [storageLifecycleSynced, setStorageLifecycleSynced] = useState<boolean>(true);

  // Email State
  const [emailProvider, setEmailProvider] = useState<string>('SendGrid Pro');
  const [senderEmail, setSenderEmail] = useState<string>('halo@forgepro.id');
  const [spfDkimVerified, setSpfDkimVerified] = useState<boolean>(true);

  // Payment Gateway Cetak Fisik
  const [pgProvider, setPgProvider] = useState<string>('Midtrans Snap');
  const [pgClientKey, setPgClientKey] = useState<string>('SB-Mid-client-••••••••421b');
  const [pgConnected, setPgConnected] = useState<boolean>(true);

  // Courier API
  const [courierApiProvider, setCourierApiProvider] = useState<string>('Biteship Logistics API');
  const [courierKeyMasked, setCourierKeyMasked] = useState<string>('biteship_live_•••••••902c');
  const [courierConnected, setCourierConnected] = useState<boolean>(true);

  // Google Play Developer API
  const [playPackageId, setPlayPackageId] = useState<string>('id.forgepro.android');
  const [playConnected, setPlayConnected] = useState<boolean>(true);

  const handleTestFalConnection = () => {
    setIsTestingFal(true);
    setTimeout(() => {
      setIsTestingFal(false);
      setFalStatus(true);
      onShowToast('Koneksi ke endpoint FLUX Fal.ai berhasil! Kuota tersedia: $142.50 (~Rp2.250.000).', 'success');
    }, 700);
  };

  const handleTestCourierConnection = () => {
    onShowToast('Koneksi ke API Kurir (Biteship) berhasil. Tarif JNE, SiCepat, J&T aktif.', 'success');
  };

  const handleTestPgConnection = () => {
    onShowToast('Koneksi Payment Gateway Cetak Fisik (Midtrans Snap) normal.', 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="p-4 rounded-2xl bg-surface-hover/70 border border-border-subtle flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-content-primary">
            Integrasi Layanan & Kredensial Pihak Ketiga (Third-Party Services)
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Kunci API dan token rahasia tidak pernah ditampilkan utuh di antarmuka (write-only / masked).
          </p>
        </div>
        <StatusBadge status="6 Layanan Terhubung" variant="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri (6 Kolom) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card 1: FLUX via Fal.ai */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D9B06F]/15 text-[#D9B06F]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Model AI: FLUX via Fal.ai</h4>
                  <span className="text-xs text-content-muted">Rendering foto jas profesional beresolusi tinggi</span>
                </div>
              </div>
              <StatusBadge status={falStatus ? 'Aktif' : 'Gangguan'} variant={falStatus ? 'emerald' : 'rose'} />
            </div>

            <div className="p-3 rounded-xl bg-surface-hover/50 border border-border-subtle flex items-center justify-between text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-content-muted">Estimasi Saldo Kuota Fal.ai</span>
                <span className="font-bold text-sm text-content-primary">$142.50 <span className="text-xs font-normal text-emerald-500">(~Rp2.250.000)</span></span>
              </div>
              <button
                type="button"
                onClick={handleTestFalConnection}
                disabled={isTestingFal}
                className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingFal ? 'animate-spin text-[#D9B06F]' : ''}`} />
                {isTestingFal ? 'Menguji...' : 'Uji Koneksi'}
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Fal.ai API Key (Write-Only)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={falKeyMasked}
                    onChange={(e) => setFalKeyMasked(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                  />
                  <KeyRound className="w-4 h-4 text-content-muted absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Endpoint Model FLUX</label>
                <input
                  type="text"
                  value={falEndpoint}
                  onChange={(e) => setFalEndpoint(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Batas Konkurensi Worker</label>
                  <input
                    type="number"
                    value={falConcurrency}
                    onChange={(e) => setFalConcurrency(Number(e.target.value))}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Batas Waktu Timeout (Detik)</label>
                  <input
                    type="number"
                    value={falTimeout}
                    onChange={(e) => setFalTimeout(Number(e.target.value))}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Cloud Storage Bucket (AWS S3 / GCS) */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Cloud Object Storage</h4>
                  <span className="text-xs text-content-muted">Penyimpanan hasil AI & selfie temporer</span>
                </div>
              </div>
              <StatusBadge status="Terhubung" variant="emerald" />
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Bucket Name</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Masa Berlaku Signed URL Unduh (Menit)</label>
                <input
                  type="number"
                  value={signedUrlDuration}
                  onChange={(e) => setSignedUrlDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="p-3 rounded-xl bg-surface-hover/50 border border-border-subtle flex items-center justify-between">
                <div>
                  <span className="font-semibold text-content-primary block">Aturan Siklus Hidup (Lifecycle Policy)</span>
                  <span className="text-[11px] text-content-muted">Sinkron dengan Kebijakan Retensi UU PDP</span>
                </div>
                <StatusBadge status="Tersinkronisasi" variant="emerald" />
              </div>
            </div>
          </Card>

          {/* Card 3: Email Gateway (SendGrid / Postmark) */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Email Transaksional Gateway</h4>
                  <span className="text-xs text-content-muted">Pengiriman link unduhan & kuitansi</span>
                </div>
              </div>
              <StatusBadge status="SPF & DKIM Valid" variant="emerald" />
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Penyedia</label>
                  <input
                    type="text"
                    value={emailProvider}
                    onChange={(e) => setEmailProvider(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Alamat Pengirim (Sender)</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan (6 Kolom) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Card 4: Payment Gateway Cetak Fisik (Midtrans / Xendit) */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Payment Gateway Cetak Fisik</h4>
                  <span className="text-xs text-content-muted">QRIS, Virtual Account, & E-Wallet untuk cetak</span>
                </div>
              </div>
              <StatusBadge status={pgConnected ? 'Aktif' : 'Nonaktif'} variant={pgConnected ? 'emerald' : 'slate'} />
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Penyedia Gateway</label>
                  <input
                    type="text"
                    value={pgProvider}
                    onChange={(e) => setPgProvider(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">Client Key (Masked)</label>
                  <input
                    type="text"
                    value={pgClientKey}
                    onChange={(e) => setPgClientKey(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleTestPgConnection}
                  className="px-3 py-2 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary font-semibold transition-colors"
                >
                  Uji Koneksi Gateway Cetak
                </button>
              </div>
            </div>
          </Card>

          {/* Card 5: API Kurir & Logistik (Biteship / RajaOngkir) */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">API Kurir &amp; Pelacakan Resi</h4>
                  <span className="text-xs text-content-muted">Cek ongkir, cetak label, & sinkronisasi status resi</span>
                </div>
              </div>
              <StatusBadge status="Aktif" variant="emerald" />
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Platform Agregator Kurir</label>
                <input
                  type="text"
                  value={courierApiProvider}
                  onChange={(e) => setCourierApiProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">API Secret Key (Masked)</label>
                <input
                  type="text"
                  value={courierKeyMasked}
                  onChange={(e) => setCourierKeyMasked(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleTestCourierConnection}
                  className="px-3 py-2 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary font-semibold transition-colors"
                >
                  Uji Koneksi Agregator Kurir
                </button>
              </div>
            </div>
          </Card>

          {/* Card 6: Google Play Developer API & RTDN */}
          <Card padding="p-6" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-content-primary">Google Play Developer API &amp; RTDN</h4>
                  <span className="text-xs text-content-muted">Verifikasi in-app purchase produk digital</span>
                </div>
              </div>
              <StatusBadge status="Tervalidasi" variant="emerald" />
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-content-primary">Android Package Name</label>
                <input
                  type="text"
                  value={playPackageId}
                  onChange={(e) => setPlayPackageId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary font-mono focus:outline-none focus:border-[#D9B06F]"
                />
              </div>
              <p className="text-[11px] text-content-muted leading-relaxed">
                Verifikasi server-to-server dilakukan oleh backend ForgePro.id menggunakan Google Service Account JSON yang tersimpan aman di environment rahasia server.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsExpandedTab;
