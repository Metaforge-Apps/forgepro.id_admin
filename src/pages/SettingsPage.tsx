import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Logo } from '../components/common/Logo';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_CONFIG, isMockMode } from '../config/business';
import {
  Lock,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';

const SETTINGS_TABS = [
  'Umum',
  'Pembayaran',
  'Cetak & pengiriman',
  'Keamanan',
  'Integrasi',
];

const DIGITAL_PRODUCTS = [
  {
    name: 'Esensial',
    price: 'Rp59.000',
    sku: 'forgepro_esensial',
    type: 'Sekali beli • produk digital',
    status: 'Sinkron • simulasi',
  },
  {
    name: 'Profesional',
    price: 'Rp99.000',
    sku: 'forgepro_profesional',
    type: 'Sekali beli • produk digital',
    status: 'Sinkron • simulasi',
  },
  {
    name: 'Eksklusif',
    price: 'Rp169.000',
    sku: 'forgepro_eksklusif',
    type: 'Sekali beli • produk digital',
    status: 'Sinkron • simulasi',
  },
];

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
        checked ? 'bg-[#D9B06F]' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm absolute top-[3px] transition-transform ${
          checked ? 'left-[22px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('Umum');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  // =====================================================================
  // TAB 1: UMUM STATES
  // =====================================================================
  const [businessName, setBusinessName] = useState<string>('ForgePro.id');
  const [supportEmail, setSupportEmail] = useState<string>('halo@forgepro.id');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+62 812-3456-7890');
  const [address, setAddress] = useState<string>(
    'Jl. Kemang Raya No. 12, Jakarta Selatan 12730'
  );

  const [language, setLanguage] = useState<string>('Indonesia');
  const [timezone, setTimezone] = useState<string>('WIB (UTC+7)');
  const [currency, setCurrency] = useState<string>('Rupiah (IDR)');
  const [downloadAccess, setDownloadAccess] = useState<string>(BUSINESS_CONFIG.defaultDownloadDurationLabel);

  const [adminFullName, setAdminFullName] = useState<string>('Andi Prasetyo');
  const [adminEmail, setAdminEmail] = useState<string>('andi@forgepro.id');

  const [notifyOrderPayment, setNotifyOrderPayment] = useState<boolean>(true);
  const [notifyPrintShip, setNotifyPrintShip] = useState<boolean>(true);
  const [notifyWebhookFail, setNotifyWebhookFail] = useState<boolean>(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState<boolean>(false);

  // =====================================================================
  // TAB 2: PEMBAYARAN STATES
  // =====================================================================
  const [androidPackageId, setAndroidPackageId] = useState<string>(
    'id.forgepro.android'
  );
  const [playConsoleConnected, setPlayConsoleConnected] = useState<boolean>(false);
  const [validateTokenServer, setValidateTokenServer] = useState<boolean>(true);
  const [ackAfterValidation, setAckAfterValidation] = useState<boolean>(true);
  const [licenseTesterEmail, setLicenseTesterEmail] = useState<string>(
    'tester@forgepro.example'
  );

  // =====================================================================
  // TAB 3: CETAK & PENGIRIMAN STATES
  // =====================================================================
  const [printSize, setPrintSize] = useState<string>('4R (10 × 15 cm)');
  const [fileQuality, setFileQuality] = useState<string>('300 dpi');
  const [paperFinish, setPaperFinish] = useState<string>('Kertas foto premium • doff');
  const [productionSla, setProductionSla] = useState<string>('1–2 hari kerja');
  const [cutoffTime, setCutoffTime] = useState<string>('14.00 WIB');
  const [qcBeforePrint, setQcBeforePrint] = useState<boolean>(true);

  const [senderName, setSenderName] = useState<string>('ForgePro.id');
  const [pickupAddress, setPickupAddress] = useState<string>(
    'Jl. Kemang Raya No. 12, Jakarta Selatan 12730'
  );
  const [senderCountry, setSenderCountry] = useState<string>('Indonesia');
  const [senderPostalCode, setSenderPostalCode] = useState<string>('12730');
  const [opsWhatsapp, setOpsWhatsapp] = useState<string>('+62 812-3456-7890');

  const [courierJne, setCourierJne] = useState<boolean>(true);
  const [courierSicepat, setCourierSicepat] = useState<boolean>(true);
  const [courierJnt, setCourierJnt] = useState<boolean>(true);
  const [courierInstant, setCourierInstant] = useState<boolean>(false);

  const [shippingCalcMethod, setShippingCalcMethod] = useState<string>(
    'Tarif kurir berdasarkan tujuan & berat'
  );
  const [initialWeight, setInitialWeight] = useState<string>('100 gram');
  const [packageDimensions, setPackageDimensions] = useState<string>('18 × 13 × 2 cm');
  const [showEta, setShowEta] = useState<boolean>(true);

  const [notifyTrackingStatus, setNotifyTrackingStatus] = useState<boolean>(true);
  const [notifyShippingIssue, setNotifyShippingIssue] = useState<boolean>(true);

  // =====================================================================
  // TAB 4: KEAMANAN STATES
  // =====================================================================
  const [securityEmail, setSecurityEmail] = useState<string>('andi@forgepro.id');
  const [alertNewLogin, setAlertNewLogin] = useState<boolean>(true);
  const [passwordPolicy, setPasswordPolicy] = useState<string>(
    'Minimal 12 karakter • huruf, angka & simbol'
  );
  const [idleTimeout, setIdleTimeout] = useState<string>('30 menit');
  const [maxSessionDuration, setMaxSessionDuration] = useState<string>('12 jam');
  const [lockAfterFailedAttempts, setLockAfterFailedAttempts] = useState<boolean>(true);
  const [require2faAllAdmins, setRequire2faAllAdmins] = useState<boolean>(true);
  const [logSensitiveActivity, setLogSensitiveActivity] = useState<boolean>(true);
  const [windowsSessionActive, setWindowsSessionActive] = useState<boolean>(true);

  // =====================================================================
  // TAB 5: INTEGRASI STATES
  // =====================================================================
  const [apiPackageId, setApiPackageId] = useState<string>('id.forgepro.android');
  const [serverCredential, setServerCredential] = useState<string>('••••••••••••••••');
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  const [rtdnTopic, setRtdnTopic] = useState<string>(
    'projects/forgepro-demo/topics/play-rtdn'
  );
  const [rtdnSubscription, setRtdnSubscription] = useState<string>(
    'projects/forgepro-demo/subscriptions/play-rtdn-sub'
  );
  const [rtdnPushEndpoint, setRtdnPushEndpoint] = useState<string>(
    'https://api.forgepro.example/google/rtdn'
  );

  const [appWebhookUrl, setAppWebhookUrl] = useState<string>(
    'https://ops.forgepro.example/webhooks/forgepro'
  );
  const [webhookSigningSecret, setWebhookSigningSecret] =
    useState<string>('••••••••••••••••');
  const [eventOrderDigital, setEventOrderDigital] = useState<boolean>(true);
  const [eventPrintShipping, setEventPrintShipping] = useState<boolean>(true);

  const [maxRetries, setMaxRetries] = useState<string>('5 kali');
  const [responseTimeout, setResponseTimeout] = useState<string>('10 detik');
  const [alertAllRetriesFailed, setAlertAllRetriesFailed] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Listen to Header "Batalkan" & "Simpan perubahan" buttons
  useEffect(() => {
    const handleHeaderAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail === 'settings-save') {
        showToast('Perubahan pengaturan berhasil disimpan dan dicatat ke log.');
      } else if (customEvent.detail === 'settings-cancel') {
        showToast('Perubahan dibatalkan dan dikembalikan ke nilai semula.');
      }
    };
    window.addEventListener('forgepro-action', handleHeaderAction);
    return () => window.removeEventListener('forgepro-action', handleHeaderAction);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Feedback Toast Banner */}
      {toastMessage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-content-muted hover:text-content-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Sesuai Referensi Figma */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-border-subtle pb-px [scrollbar-width:none]">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px select-none ${
                isActive
                  ? 'border-[#D9B06F] text-content-primary font-semibold'
                  : 'border-transparent text-content-muted hover:text-content-primary font-medium'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* TAB 1: UMUM                                                       */}
      {/* ================================================================= */}
      {activeTab === 'Umum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* KOLOM KIRI (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Card 1: Profil bisnis */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Profil bisnis
              </h2>

              {/* Logo Preview & Ganti Logo */}
              <div className="flex items-center gap-4 py-1">
                <Logo variant="horizontal" size="md" />
                <button
                  type="button"
                  onClick={() =>
                    showToast('Dialog pemilihan file logo dibuka.')
                  }
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Ganti logo
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Nama bisnis
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Email layanan pelanggan
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Nomor WhatsApp bisnis
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Alamat operasional
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>
              </div>
            </Card>

            {/* Card 2: Preferensi operasional */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Preferensi operasional
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Bahasa
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
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

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Mata uang
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Akses unduhan
                  </label>
                  <input
                    type="text"
                    value={downloadAccess}
                    onChange={(e) => setDownloadAccess(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>
              </div>

              <span className="text-xs text-content-muted">
                Tanggal, nominal, dan notifikasi mengikuti preferensi ini.
              </span>
            </Card>
          </div>

          {/* KOLOM KANAN (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Akun saya */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Akun saya
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Admin Utama
                </span>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Nama lengkap
                  </label>
                  <input
                    type="text"
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Email akun
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-content-muted">
                    Autentikasi dua langkah
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Aktif
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Ubah kata sandi</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Card 2: Notifikasi admin */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Notifikasi admin
              </h2>

              <div className="divide-y divide-border-subtle/60 text-xs">
                <div className="py-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Pesanan & pembayaran
                    </span>
                    <span className="text-content-muted">
                      Kirim email saat pembayaran berhasil atau gagal.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notifyOrderPayment}
                    onChange={setNotifyOrderPayment}
                  />
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Produksi & pengiriman
                    </span>
                    <span className="text-content-muted">
                      Ingatkan pesanan cetak dan kendala pengiriman.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notifyPrintShip}
                    onChange={setNotifyPrintShip}
                  />
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Kegagalan webhook
                    </span>
                    <span className="text-content-muted">
                      Kirim peringatan jika seluruh percobaan gagal.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notifyWebhookFail}
                    onChange={setNotifyWebhookFail}
                  />
                </div>

                <div className="pt-3 pb-0 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Ringkasan harian
                    </span>
                    <span className="text-content-muted">
                      Kirim rekap aktivitas setiap pukul 18.00 WIB.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notifyDailySummary}
                    onChange={setNotifyDailySummary}
                  />
                </div>
              </div>
            </Card>

            {/* Info Notice */}
            <div className="flex items-start gap-2.5 px-1">
              <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-content-primary">
                  Perubahan tercatat otomatis
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Setiap perubahan pengaturan disimpan pada Log Aktivitas &
                  Webhook beserta waktu dan admin yang melakukan perubahan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: PEMBAYARAN                                                 */}
      {/* ================================================================= */}
      {activeTab === 'Pembayaran' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* KOLOM KIRI (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Card 1: Google Play Billing */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Google Play Billing
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Demo
                  </span>
                )}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Satu-satunya metode pembelian produk digital di aplikasi Android
                ForgePro.id.
              </p>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-semibold text-content-primary">
                  Package ID aplikasi Android
                </label>
                <input
                  type="text"
                  value={androidPackageId}
                  onChange={(e) => setAndroidPackageId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <span className="text-content-muted mt-0.5">
                  Contoh konfigurasi • belum terhubung ke aplikasi nyata.
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold text-content-primary">
                  Koneksi Play Console
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                    playConsoleConnected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                  }`}
                >
                  {playConsoleConnected ? 'Terhubung • demo' : 'Belum terhubung'}
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setPlayConsoleConnected(!playConsoleConnected);
                    showToast(
                      !playConsoleConnected
                        ? 'Simulasi koneksi Play Console berhasil diuji.'
                        : 'Koneksi Play Console dikembalikan ke status belum terhubung.'
                    );
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Uji koneksi demo
                </button>
              </div>
            </Card>

            {/* Card 2: Pemetaan produk digital */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-base font-semibold text-content-primary">
                  Pemetaan produk digital
                </h2>
                <p className="text-xs text-content-muted leading-relaxed">
                  Produk sekali beli Google Play, bukan langganan. ID di bawah
                  merupakan contoh.
                </p>
              </div>

              <div className="divide-y divide-border-subtle/60 text-xs">
                {DIGITAL_PRODUCTS.map((prod) => (
                  <div
                    key={prod.sku}
                    className="py-3.5 first:pt-1 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-content-primary">
                        {prod.name}
                      </span>
                      <span className="font-semibold text-content-primary">
                        {prod.price}
                      </span>
                    </div>

                    <span className="text-content-primary">{prod.sku}</span>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-content-muted">{prod.type}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                        {prod.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Harga di atas adalah referensi dalam IDR. Harga aktual dan
                ketersediaan mengikuti Google Play Console.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Pemetaan 3 produk digital berhasil disinkronkan (mode demo).'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Sinkronkan produk demo
                </button>
              </div>
            </Card>

            {/* Info Notice */}
            <div className="flex items-start gap-2.5 px-1">
              <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-content-primary">
                  Hanya untuk produk digital
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Biaya cetak dan pengiriman fisik tidak ditagih melalui Google
                  Play Billing. Akses unduhan produk digital berlaku {BUSINESS_CONFIG.defaultDownloadDurationLabel}.
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Validasi pembelian */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Validasi pembelian
              </h2>

              <div className="divide-y divide-border-subtle/60 text-xs">
                <div className="pb-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-content-primary">
                      Validasi purchase token di server
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Backend memeriksa token, package ID, product ID, dan status
                      pembelian melalui Google Play Developer API.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={validateTokenServer}
                    onChange={setValidateTokenServer}
                  />
                </div>

                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-content-primary">
                      Acknowledgment setelah validasi
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Setelah status PURCHASED terverifikasi, backend mengirim
                      acknowledgment sebelum memberikan hak akses.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={ackAfterValidation}
                    onChange={setAckAfterValidation}
                  />
                </div>

                <div className="pt-4 flex flex-col gap-2.5">
                  <span className="font-semibold text-content-primary">
                    Alur pemberian hak akses
                  </span>
                  <p className="text-content-muted leading-relaxed">
                    Token diterima &rarr; verifikasi server &rarr; acknowledgment
                    &rarr; hak digital diberikan. Proses idempoten mencegah
                    pemberian hak ganda.
                  </p>
                  <p className="text-content-muted leading-relaxed">
                    Jika acknowledgment gagal, ulangi di server dan tahan
                    pemberian hak hingga berhasil. Selesaikan dalam batas waktu
                    Google Play.
                  </p>
                  <p className="text-content-muted leading-relaxed">
                    Konfigurasi API dan RTDN tersedia pada tab Integrasi.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2: Status transaksi */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Status transaksi
              </h2>

              <div className="flex flex-col gap-3.5 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-content-primary">
                    Tertunda (pending)
                  </span>
                  <p className="text-content-muted leading-relaxed">
                    Tunggu status PURCHASED terverifikasi. Jangan lakukan
                    acknowledgment atau berikan hak saat masih pending.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-content-primary">
                    Dibatalkan (cancel)
                  </span>
                  <p className="text-content-muted leading-relaxed">
                    Tutup transaksi tanpa memberikan hak akses; izinkan pengguna
                    mencoba kembali.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-content-primary">
                    Pengembalian dana (refund)
                  </span>
                  <p className="text-content-muted leading-relaxed">
                    Verifikasi ulang status melalui API, catat perubahan, lalu
                    cabut hak sesuai hasil verifikasi.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 3: Pengujian pembelian */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Pengujian pembelian
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Demo
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-semibold text-content-primary">
                  Akun license tester
                </label>
                <input
                  type="email"
                  value={licenseTesterEmail}
                  onChange={(e) => setLicenseTesterEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
                <p className="text-content-muted leading-relaxed mt-1">
                  Tambahkan akun di Play Console &rarr; Pengujian lisensi, lalu
                  berikan akses ke jalur pengujian internal. Tidak ada transaksi
                  nyata pada mockup ini.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Membuka dokumentasi pengujian lisensi Google Play Billing.'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Lihat panduan pengujian
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: CETAK & PENGIRIMAN                                         */}
      {/* ================================================================= */}
      {activeTab === 'Cetak & pengiriman' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* KOLOM KIRI (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Card 1: Standar produksi */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-content-primary">
                  Standar produksi
                </h2>
                <p className="text-xs text-content-muted leading-relaxed">
                  Tentukan spesifikasi standar untuk pesanan cetak fisik.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Ukuran cetak
                  </label>
                  <input
                    type="text"
                    value={printSize}
                    onChange={(e) => setPrintSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Kualitas berkas
                  </label>
                  <input
                    type="text"
                    value={fileQuality}
                    onChange={(e) => setFileQuality(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-semibold text-content-primary">
                  Kertas dan hasil akhir
                </label>
                <input
                  type="text"
                  value={paperFinish}
                  onChange={(e) => setPaperFinish(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    SLA produksi
                  </label>
                  <input
                    type="text"
                    value={productionSla}
                    onChange={(e) => setProductionSla(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Batas pemrosesan
                  </label>
                  <input
                    type="text"
                    value={cutoffTime}
                    onChange={(e) => setCutoffTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>
              </div>

              <div className="py-3.5 border-t border-b border-border-subtle/60 flex items-center justify-between gap-4 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary">
                    Pemeriksaan kualitas sebelum cetak
                  </span>
                  <span className="text-content-muted leading-relaxed">
                    Periksa ketajaman, warna, dan pemotongan foto sebelum masuk
                    produksi.
                  </span>
                </div>
                <ToggleSwitch
                  checked={qcBeforePrint}
                  onChange={setQcBeforePrint}
                />
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Pesanan setelah batas waktu diproses pada hari kerja berikutnya.
                Operasional Senin–Jumat, kecuali hari libur.
              </p>
            </Card>

            {/* Card 2: Alamat asal operasional */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Alamat asal operasional
              </h2>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Nama pengirim
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Alamat penjemputan
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Negara
                    </label>
                    <input
                      type="text"
                      value={senderCountry}
                      onChange={(e) => setSenderCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Kode pos
                    </label>
                    <input
                      type="text"
                      value={senderPostalCode}
                      onChange={(e) => setSenderPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    WhatsApp operasional
                  </label>
                  <input
                    type="text"
                    value={opsWhatsapp}
                    onChange={(e) => setOpsWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>
              </div>

              <span className="text-xs text-content-muted">
                Alamat ini digunakan untuk penjemputan kurir dan perhitungan
                ongkir.
              </span>
            </Card>
          </div>

          {/* KOLOM KANAN (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Kurir & layanan */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Kurir & layanan
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Contoh
                  </span>
                )}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Pilihan aktif berikut adalah konfigurasi ilustratif, bukan
                koneksi kurir langsung.
              </p>

              <div className="divide-y divide-border-subtle/60 text-xs">
                <div className="py-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      JNE
                    </span>
                    <span className="text-content-muted">
                      REG • estimasi 2–4 hari kerja
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={courierJne}
                    onChange={setCourierJne}
                  />
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      SiCepat
                    </span>
                    <span className="text-content-muted">
                      REG • estimasi 2–3 hari kerja
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={courierSicepat}
                    onChange={setCourierSicepat}
                  />
                </div>

                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      J&amp;T Express
                    </span>
                    <span className="text-content-muted">
                      EZ • estimasi 2–4 hari kerja
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={courierJnt}
                    onChange={setCourierJnt}
                  />
                </div>

                <div className="pt-3 pb-0 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Layanan instan
                    </span>
                    <span className="text-content-muted">
                      Tidak tersedia untuk pesanan cetak.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={courierInstant}
                    onChange={setCourierInstant}
                  />
                </div>
              </div>
            </Card>

            {/* Card 2: Ongkir & estimasi */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Ongkir &amp; estimasi
              </h2>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Metode perhitungan
                  </label>
                  <input
                    type="text"
                    value={shippingCalcMethod}
                    onChange={(e) => setShippingCalcMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Berat awal paket
                    </label>
                    <input
                      type="text"
                      value={initialWeight}
                      onChange={(e) => setInitialWeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Dimensi kemasan
                    </label>
                    <input
                      type="text"
                      value={packageDimensions}
                      onChange={(e) => setPackageDimensions(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>
                </div>

                <div className="py-3.5 border-t border-b border-border-subtle/60 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Tampilkan estimasi tiba
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      SLA produksi + estimasi layanan kurir. Perbarui jika ada
                      keterlambatan.
                    </span>
                  </div>
                  <ToggleSwitch checked={showEta} onChange={setShowEta} />
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Ongkir final mengikuti wilayah, pembulatan berat, dan tarif
                layanan yang dipilih.
              </p>
            </Card>

            {/* Card 3: Notifikasi pengiriman */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Notifikasi pengiriman
              </h2>

              <div className="divide-y divide-border-subtle/60 text-xs">
                <div className="pb-3.5 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Nomor resi &amp; perubahan status
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Kirim email saat paket diserahkan, dalam perjalanan, dan
                      diterima.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notifyTrackingStatus}
                    onChange={setNotifyTrackingStatus}
                  />
                </div>

                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Peringatan kendala pengiriman
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Kirim ke halo@forgepro.id jika paket tertunda atau gagal
                      dikirim.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={notifyShippingIssue}
                    onChange={setNotifyShippingIssue}
                  />
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Waktu notifikasi mengikuti WIB (UTC+7). Semua perubahan tercatat
                di log aktivitas.
              </p>
            </Card>

            {/* Info Notice */}
            <div className="flex items-start gap-2.5 px-1">
              <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-content-primary">
                  Terpisah dari pembelian digital
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Pengaturan ini hanya untuk produksi dan pengiriman fisik.
                  Biayanya tidak ditagih melalui Google Play Billing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: KEAMANAN                                                   */}
      {/* ================================================================= */}
      {activeTab === 'Keamanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* KOLOM KIRI (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Card 1: Keamanan akun */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Keamanan akun
              </h2>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-content-primary">
                  Andi Prasetyo
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Admin Utama
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-semibold text-content-primary">
                  Email akun
                </label>
                <input
                  type="email"
                  value={securityEmail}
                  onChange={(e) => setSecurityEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs pt-1">
                <span className="font-semibold text-content-primary">
                  Autentikasi dua langkah
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  Aktif
                </span>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Gunakan aplikasi autentikator untuk kode sekali pakai saat
                masuk. Kode dan kunci pemulihan tidak ditampilkan.
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Pengaturan aplikasi autentikator TOTP telah aktif.'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Kelola autentikator
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Verifikasi ulang diperlukan untuk melihat kode pemulihan.'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Kode pemulihan
                </button>
              </div>

              <div className="pt-3.5 border-t border-border-subtle/60 flex items-center justify-between gap-4 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-content-primary">
                    Peringatan masuk baru
                  </span>
                  <span className="text-content-muted leading-relaxed">
                    Kirim email saat akun diakses dari perangkat yang belum
                    dikenali.
                  </span>
                </div>
                <ToggleSwitch
                  checked={alertNewLogin}
                  onChange={setAlertNewLogin}
                />
              </div>
            </Card>

            {/* Card 2: Kata sandi & sesi */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Kata sandi &amp; sesi
              </h2>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Kebijakan kata sandi
                  </label>
                  <input
                    type="text"
                    value={passwordPolicy}
                    onChange={(e) => setPasswordPolicy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Batas tidak aktif
                    </label>
                    <input
                      type="text"
                      value={idleTimeout}
                      onChange={(e) => setIdleTimeout(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Durasi sesi maksimum
                    </label>
                    <input
                      type="text"
                      value={maxSessionDuration}
                      onChange={(e) => setMaxSessionDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>
                </div>

                <div className="py-3.5 border-b border-border-subtle/60 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Kunci setelah percobaan gagal
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      5 percobaan gagal berturut-turut mengunci akses selama 15
                      menit.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={lockAfterFailedAttempts}
                    onChange={setLockAfterFailedAttempts}
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Ubah kata sandi
                  </button>
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Perubahan kata sandi memerlukan verifikasi dua langkah dan
                mengakhiri sesi lain.
              </p>
            </Card>

            {/* Info Notice */}
            <div className="flex items-start gap-2.5 px-1">
              <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-content-primary">
                  Pengaturan keamanan dilindungi
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Perubahan kebijakan hanya dapat dilakukan Admin Utama setelah
                  autentikasi ulang.
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Sesi & perangkat aktif */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Sesi &amp; perangkat aktif
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Data contoh
                  </span>
                )}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Daftar ilustratif untuk pratinjau; bukan aktivitas akun nyata.
              </p>

              <div className="divide-y divide-border-subtle/60 text-xs">
                {/* Session 1 */}
                <div className="pb-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-content-primary">
                      Chrome • macOS
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      Sesi ini
                    </span>
                  </div>
                  <span className="text-content-muted">
                    Jakarta, Indonesia • 21 Okt 2026, 09.15 WIB
                  </span>
                </div>

                {/* Session 2 */}
                {windowsSessionActive && (
                  <div className="py-3.5 flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-content-primary">
                          Chrome • Windows
                        </span>
                        {isMockMode() && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                            Contoh
                          </span>
                        )}
                      </div>
                      <span className="text-content-muted">
                        Jakarta, Indonesia • 20 Okt 2026, 16.42 WIB
                      </span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setWindowsSessionActive(false);
                          showToast(
                            'Sesi contoh Chrome • Windows telah diakhiri.'
                          );
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                      >
                        Akhiri sesi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setWindowsSessionActive(false);
                    showToast('Berhasil keluar dari seluruh sesi perangkat lain.');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Keluar dari sesi lain
                </button>
              </div>
            </Card>

            {/* Card 2: Akses admin & audit */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Akses admin &amp; audit
              </h2>

              <div className="divide-y divide-border-subtle/60 text-xs">
                <div className="pb-3.5 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Wajib dua langkah untuk admin
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Semua admin harus mengaktifkan autentikasi dua langkah
                      sebelum mengakses operasional.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={require2faAllAdmins}
                    onChange={setRequire2faAllAdmins}
                  />
                </div>

                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Catat aktivitas sensitif
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Rekam perubahan pengaturan, akses admin, ekspor, dan
                      tindakan keamanan.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={logSensitiveActivity}
                    onChange={setLogSensitiveActivity}
                  />
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Hak akses mengikuti peran. Hanya Admin Utama yang dapat
                mengelola peran dan mencabut akses admin.
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/manajemen-admin')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Kelola akses admin
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/log-aktivitas')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                >
                  Lihat log aktivitas
                </button>
              </div>
            </Card>

            {/* Card 3: Tindakan berisiko (Danger Border Card) */}
            <div className="rounded-2xl p-6 sm:p-7 bg-surface-card border border-rose-500/30 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Tindakan berisiko
              </h2>

              <p className="text-xs text-content-muted leading-relaxed">
                Gunakan hanya jika ada indikasi akun disalahgunakan. Tindakan
                berikut memerlukan kata sandi dan kode dua langkah.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'Konfirmasi keamanan diperlukan untuk mencabut seluruh sesi.'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-rose-500/40 text-rose-600 dark:text-rose-400 bg-surface-card hover:bg-rose-500/10 transition-colors"
                >
                  Cabut seluruh sesi
                </button>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Mengeluarkan semua perangkat, termasuk sesi ini. Akun dan data
                bisnis tidak dihapus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: INTEGRASI                                                  */}
      {/* ================================================================= */}
      {activeTab === 'Integrasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* KOLOM KIRI (7 Kolom) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Card 1: Google Play Developer API */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Google Play Developer API
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Demo
                  </span>
                )}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Verifikasi detail pembelian dan acknowledgment dilakukan oleh
                backend, bukan dari aplikasi klien.
              </p>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Package ID
                  </label>
                  <input
                    type="text"
                    value={apiPackageId}
                    onChange={(e) => setApiPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Kredensial server
                  </label>
                  <input
                    type="text"
                    value={serverCredential}
                    onChange={(e) => setServerCredential(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary tracking-widest focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                  <span className="text-content-muted leading-relaxed mt-0.5">
                    Contoh tampilan tersamarkan. Belum ada kredensial nyata
                    tersimpan; kelola hanya di penyimpanan rahasia server.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-content-primary">
                    Koneksi API
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      apiConnected
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {apiConnected ? 'Terhubung • demo' : 'Belum terhubung'}
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setApiConnected(!apiConnected);
                      showToast(
                        !apiConnected
                          ? 'Simulasi verifikasi Google Play Developer API berhasil.'
                          : 'Status koneksi API dikembalikan ke belum terhubung.'
                      );
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Uji verifikasi demo
                  </button>
                </div>
              </div>
            </Card>

            {/* Card 2: RTDN • Cloud Pub/Sub */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  RTDN • Cloud Pub/Sub
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Demo
                  </span>
                )}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Notifikasi perubahan pembelian dari Google Play. Seluruh nilai
                berikut adalah contoh konfigurasi.
              </p>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Topic Google Cloud
                  </label>
                  <input
                    type="text"
                    value={rtdnTopic}
                    onChange={(e) => setRtdnTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Subscription backend
                  </label>
                  <input
                    type="text"
                    value={rtdnSubscription}
                    onChange={(e) => setRtdnSubscription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Endpoint push terautentikasi
                  </label>
                  <input
                    type="text"
                    value={rtdnPushEndpoint}
                    onChange={(e) => setRtdnPushEndpoint(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                  <span className="text-content-muted leading-relaxed mt-0.5">
                    Batasi publisher ke layanan Google Play yang berwenang.
                    Backend memverifikasi identitas push dan memproses pesan
                    secara idempoten.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-content-primary">
                    Pesan uji
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Diterima • simulasi
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        'Notifikasi uji RTDN berhasil dikirim ke endpoint simulasi.'
                      )
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Kirim notifikasi uji demo
                  </button>
                </div>
              </div>
            </Card>

            {/* Info Notice */}
            <div className="flex items-start gap-2.5 px-1">
              <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-content-primary">
                  RTDN bukan sumber hak akses tunggal
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  RTDN memberi sinyal perubahan. Backend kemudian memverifikasi
                  detail dan status pembelian melalui Google Play Developer API
                  sebelum memperbarui hak akses.
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (5 Kolom) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Webhook aplikasi */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-content-primary">
                  Webhook aplikasi
                </h2>
                {isMockMode() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-[#D9B06F]/10 text-[#9A7432] dark:text-[#D9B06F] border-[#D9B06F]/50">
                    Demo
                  </span>
                )}
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Kirim peristiwa bisnis ke sistem internal. Tidak ada pengiriman
                langsung pada konfigurasi contoh ini.
              </p>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    URL tujuan webhook
                  </label>
                  <input
                    type="text"
                    value={appWebhookUrl}
                    onChange={(e) => setAppWebhookUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-content-primary">
                    Secret penandatanganan
                  </label>
                  <input
                    type="text"
                    value={webhookSigningSecret}
                    onChange={(e) => setWebhookSigningSecret(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary tracking-widest focus:outline-none focus:border-[#D9B06F] transition-colors"
                  />
                  <span className="text-content-muted leading-relaxed mt-0.5">
                    Secret tidak pernah ditampilkan utuh. Validasi tanda tangan
                    dan timestamp di penerima.
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <span className="font-semibold text-content-primary">
                    Peristiwa yang dikirim
                  </span>

                  <div className="divide-y divide-border-subtle/60">
                    <div className="py-3 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-content-primary">
                          Pesanan &amp; pembelian digital
                        </span>
                        <span className="text-content-muted">
                          order.created • purchase.verified • purchase.refunded
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={eventOrderDigital}
                        onChange={setEventOrderDigital}
                      />
                    </div>

                    <div className="py-3 border-b border-border-subtle/60 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-content-primary">
                          Produksi &amp; pengiriman
                        </span>
                        <span className="text-content-muted">
                          print.completed • shipment.updated • shipment.failed
                        </span>
                      </div>
                      <ToggleSwitch
                        checked={eventPrintShipping}
                        onChange={setEventPrintShipping}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        'Webhook uji demo berhasil dikirim (Respons: 200 OK).'
                      )
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Kirim webhook uji demo
                  </button>
                </div>
              </div>
            </Card>

            {/* Card 2: Percobaan ulang & log */}
            <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-content-primary">
                Percobaan ulang &amp; log
              </h2>

              <div className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Maksimum percobaan
                    </label>
                    <input
                      type="text"
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-content-primary">
                      Batas waktu respons
                    </label>
                    <input
                      type="text"
                      value={responseTimeout}
                      onChange={(e) => setResponseTimeout(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface-card text-content-primary focus:outline-none focus:border-[#D9B06F] transition-colors"
                    />
                  </div>
                </div>

                <p className="text-content-muted leading-relaxed">
                  Jeda bertahap: 1, 5, 15, lalu 60 menit. Respons 2xx dianggap
                  berhasil; gunakan ID peristiwa untuk mencegah pemrosesan
                  ganda.
                </p>

                <div className="py-3.5 border-t border-b border-border-subtle/60 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-content-primary">
                      Peringatan seluruh percobaan gagal
                    </span>
                    <span className="text-content-muted leading-relaxed">
                      Kirim pemberitahuan ke halo@forgepro.id dan catat kegagalan
                      untuk ditinjau admin.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={alertAllRetriesFailed}
                    onChange={setAlertAllRetriesFailed}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-content-primary">
                    Catatan uji • data simulasi
                  </span>
                  <span className="text-content-muted">
                    21 Okt 2026, 09.30 WIB • RTDN diterima
                  </span>
                  <span className="text-content-muted">
                    21 Okt 2026, 09.31 WIB • Webhook uji: 200 OK
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/log-aktivitas')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors"
                  >
                    Buka Log Aktivitas &amp; Webhook
                  </button>
                </div>
              </div>
            </Card>

            {/* Info Notice */}
            <div className="flex items-start gap-2.5 px-1">
              <Info className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-content-primary">
                  Rahasia tetap di server
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Jangan simpan JSON service account atau private key di
                  aplikasi. Semua status koneksi dan log di halaman ini adalah
                  contoh, bukan koneksi layanan nyata.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Perbarui kata sandi akun Admin Utama ({adminEmail}).
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowPasswordModal(false);
                showToast('Kata sandi akun berhasil diperbarui.');
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

export default SettingsPage;
