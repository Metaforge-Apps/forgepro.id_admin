import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { mockDb } from '../mocks/db';

const BACKUP_CODES = [
  'FP-9812-4412',
  'FP-5512-8891',
  'FP-3301-7724',
  'FP-6641-2290',
  'FP-1198-4432',
  'FP-7721-0094',
  'FP-8842-5519',
  'FP-2209-6614',
];

/**
 * Halaman Terima Undangan Admin Baru ForgePro.id (Fase 7: Item 35 & 36)
 * Alur: Set Password Baru (min 12 chars + strength) -> Aktivasi 2FA TOTP -> Simpan & Unduh Kode Cadangan
 */
export function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'INV-202610-DEMO';
  const inviteEmail = searchParams.get('email') || 'staf.baru@forgepro.id';

  const { login } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('Staf Baru ForgePro');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [hasDownloadedBackup, setHasDownloadedBackup] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Strength
  const strength = React.useMemo(() => {
    let score = 0;
    if (password.length >= 12) score += 40;
    else if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return Math.min(100, score);
  }, [password]);

  const strengthLabel = React.useMemo(() => {
    if (strength >= 80) return { label: 'Sangat Kuat', color: 'text-emerald-500 bg-emerald-500' };
    if (strength >= 60) return { label: 'Kuat', color: 'text-[#D9B06F] bg-[#D9B06F]' };
    if (strength >= 40) return { label: 'Sedang', color: 'text-amber-500 bg-amber-500' };
    return { label: 'Lemah (Min 12 Karakter)', color: 'text-rose-500 bg-rose-500' };
  }, [strength]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 12) {
      setErrorMsg('Kata sandi wajib minimal 12 karakter.');
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (totpCode.trim().length < 6) {
      setErrorMsg('Masukkan 6 digit kode dari aplikasi autentikator.');
      return;
    }
    setStep(3);
  };

  const handleDownloadBackupCodes = () => {
    const textContent = `FORGEPRO.ID - KODE CADANGAN SEKALI PAKAI 2FA
Akun: ${inviteEmail}
Tanggal Dibuat: ${new Date().toLocaleString('id-ID')}

Simpan kode cadangan ini di tempat aman. Setiap kode hanya dapat digunakan satu kali:
${BACKUP_CODES.map((c, i) => `${i + 1}. ${c}`).join('\n')}
`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forgepro-backup-codes-${inviteEmail}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setHasDownloadedBackup(true);
    showToast('Berkas kode cadangan berhasil diunduh', 'success');
  };

  const handleFinish = async () => {
    mockDb.appendActivityLog({
      source: inviteEmail,
      category: 'Admin',
      activity: `Aktivasi undangan admin selesai · ${name} (${inviteEmail})`,
      result: 'Berhasil',
      targetId: token,
    });

    showToast('Pendaftaran akun admin selesai! Masuk ke dashboard...', 'success');
    try {
      await login('admin@forgepro.id', 'admin123');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F7F5F0] dark:bg-[#0A111C] text-content-primary relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg flex flex-col items-center my-8">
        <div className="mb-6">
          <Logo variant="horizontal" size="xl" />
        </div>

        <div className="w-full rounded-3xl p-7 sm:p-9 bg-surface-card border border-border-card shadow-2xl space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle text-xs">
            <span className={`font-semibold ${step === 1 ? 'text-[#D9B06F]' : 'text-content-muted'}`}>
              1. Kata Sandi
            </span>
            <span className="text-content-muted">&rarr;</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#D9B06F]' : 'text-content-muted'}`}>
              2. Aktivasi 2FA
            </span>
            <span className="text-content-muted">&rarr;</span>
            <span className={`font-semibold ${step === 3 ? 'text-[#D9B06F]' : 'text-content-muted'}`}>
              3. Kode Cadangan
            </span>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: PASSWORD */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4 text-xs">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-content-primary">
                  Terima Undangan Admin
                </h3>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">
                  Selamat datang di panel admin ForgePro.id. Silakan lengkapi profil dan buat kata sandi aman Anda.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-hover/50 border border-border-subtle flex justify-between items-center">
                <span className="text-content-muted">Email Undangan:</span>
                <span className="font-mono font-semibold text-content-primary">{inviteEmail}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-content-primary">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-content-primary">
                  Buat Kata Sandi (Min. 12 Karakter)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 12 karakter..."
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthLabel.color.split(' ')[1]}`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-content-muted">Kekuatan:</span>
                      <span className={`font-semibold ${strengthLabel.color.split(' ')[0]}`}>
                        {strengthLabel.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Aktivasi 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: AKTIVASI 2FA TOTP */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4 text-xs">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-content-primary">
                  Aktivasi 2FA (TOTP)
                </h3>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">
                  Pindai kode QR menggunakan Google Authenticator atau Authy, lalu masukkan 6 digit kode yang tampil.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-hover/40 border border-border-subtle flex flex-col items-center justify-center gap-3">
                <div className="w-36 h-36 rounded-2xl bg-white p-3 flex items-center justify-center shadow-md">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div className="text-center space-y-0.5">
                  <span className="text-[11px] text-content-muted block">Kunci Rahasia Manual:</span>
                  <span className="font-mono font-bold text-xs text-[#9A7432] dark:text-[#D9B06F] tracking-wider select-all">
                    FP2FA-4821-9920-ABCD
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-content-primary block text-center">
                  Masukkan 6 Digit Kode Konfirmasi
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface-main text-content-primary font-mono text-center text-lg tracking-[0.3em] font-bold focus:outline-none focus:border-[#D9B06F]"
                />
                <span className="text-[11px] text-content-muted block text-center">
                  Demo Code: <button type="button" onClick={() => setTotpCode('123456')} className="text-[#D9B06F] hover:underline font-semibold">123456</button>
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors text-xs"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm text-xs flex items-center justify-center gap-2"
                >
                  <span>Verifikasi &amp; Lanjut</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: KODE CADANGAN SEKALI PAKAI */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-content-primary">
                  Kode Cadangan Sekali Pakai
                </h3>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">
                  Jika Anda kehilangan akses ke aplikasi autentikator, gunakan salah satu kode cadangan ini untuk masuk ke akun Anda.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 rounded-2xl bg-surface-hover/40 border border-border-subtle">
                {BACKUP_CODES.map((code) => (
                  <div
                    key={code}
                    className="p-2 rounded-lg bg-surface-card font-mono text-[11px] font-semibold text-content-primary text-center border border-border-subtle/70"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDownloadBackupCodes}
                className="w-full py-2.5 rounded-xl font-semibold border border-border-subtle bg-surface-card hover:bg-surface-hover text-content-primary transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4 text-[#D9B06F]" />
                <span>Unduh Kode Cadangan (.txt)</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan Pendaftaran &amp; Masuk</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcceptInvitePage;
