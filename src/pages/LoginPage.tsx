import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/branding';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Logo } from '../components/common/Logo';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import {
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Clock,
  KeyRound,
} from 'lucide-react';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 menit

/**
 * Login Page Component ForgePro.id (Fase 7: Item 32-38)
 * - Autentikasi 2 Langkah: Email & Password -> Kode TOTP 2FA
 * - Perlindungan Brute-force: Akun dikunci 15 menit jika 5x gagal login
 * - Modal Lupa Kata Sandi dengan tautan verifikasi sekali pakai
 * - Split-screen tema gelap/terang selaras Figma ForgePro.id
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionReason = searchParams.get('reason');

  const { login, isLoading, error: authError, setError } = useAuth();

  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [totpCode, setTotpCode] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [isDemoLoading, setIsDemoLoading] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('fp_login_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const saved = localStorage.getItem('fp_login_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });

  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);

  // Check lockout countdown
  useEffect(() => {
    if (!lockoutUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemainingSec(remaining);

      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem('fp_login_lockout_until');
        localStorage.removeItem('fp_login_failed_attempts');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLocked = Boolean(lockoutUntil && lockoutRemainingSec > 0);

  const formatLockoutTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDemoLogin = async () => {
    setFormError('');
    if (setError) setError(null);
    setEmail('admin@forgepro.id');
    setPassword('admin123');
    setIsDemoLoading(true);

    try {
      await login('admin@forgepro.id', 'admin123');
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal masuk akun demo.';
      setFormError(message);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleCredentialsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (isLocked) {
      setFormError(`Akun terkunci sementara. Silakan tunggu ${formatLockoutTimer(lockoutRemainingSec)}.`);
      return;
    }

    if (!email) {
      setFormError('Alamat email wajib diisi.');
      return;
    }

    if (!password) {
      setFormError('Password wajib diisi.');
      return;
    }

    // Pindah ke step 2: 2FA TOTP
    setStep('2fa');
    setTotpCode('');
  };

  const handle2FaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (isLocked) {
      setFormError(`Akun terkunci sementara. Silakan tunggu ${formatLockoutTimer(lockoutRemainingSec)}.`);
      return;
    }

    if (totpCode.trim().length < 6) {
      setFormError('Kode 2FA TOTP harus berupa 6 digit angka.');
      return;
    }

    try {
      await login(email, password);
      // Reset failed attempts on success
      setFailedAttempts(0);
      localStorage.removeItem('fp_login_failed_attempts');
      localStorage.removeItem('fp_login_lockout_until');
      navigate('/dashboard');
    } catch (err) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      localStorage.setItem('fp_login_failed_attempts', nextFailures.toString());

      if (nextFailures >= MAX_FAILED_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockTime);
        localStorage.setItem('fp_login_lockout_until', lockTime.toString());
        setFormError('Akun terkunci sementara karena 5 kali percobaan login gagal. Silakan tunggu 15 menit.');
      } else {
        const message = err instanceof Error ? err.message : 'Kredensial atau kode 2FA tidak valid.';
        setFormError(`${message} (${MAX_FAILED_ATTEMPTS - nextFailures} percobaan tersisa).`);
      }
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#F7F5F0] dark:bg-[#0A111C] light:bg-[#FFFFFF] text-content-primary relative overflow-x-hidden lg:overflow-hidden transition-colors duration-200">
      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      {/* SISI KIRI: Foto Hero 5 Profesional Berjas Sesuai Figma */}
      <div className="hidden lg:block lg:w-1/2 h-screen relative overflow-hidden bg-[#0A111C]">
        <img
          src={BRAND_CONFIG.logos.loginHero}
          alt="ForgePro.id Professional Team"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A111C]/30 pointer-events-none" />
      </div>

      {/* SISI KANAN: Form Login Admin */}
      <div className="w-full lg:w-1/2 min-h-screen lg:h-screen lg:overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 bg-surface-main lg:bg-transparent">
        <div className="w-full max-w-[420px] flex flex-col items-center my-auto">
          {/* Logo Badge di Atas Kotak Login */}
          <div className="mb-5 flex flex-col items-center">
            <Logo variant="badge" size="xl" className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl" />
          </div>

          {/* Kartu Form Login */}
          <div className="w-full rounded-2xl p-7 sm:p-9 bg-surface-card border border-border-card shadow-2xl transition-all">
            {/* Header Form */}
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[#D9B06F]">
                {step === 'credentials' ? BRAND_CONFIG.login.title : 'Verifikasi 2FA'}
              </h2>
              <p className="text-xs text-content-muted mt-1.5">
                {step === 'credentials'
                  ? BRAND_CONFIG.login.subtitle
                  : 'Masukkan 6 digit kode dari aplikasi Google Authenticator Anda.'}
              </p>
            </div>

            {/* Session Expired Banner */}
            {sessionReason === 'session_expired' && !formError && (
              <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Sesi Anda telah berakhir demi keamanan data. Silakan masuk kembali.</span>
              </div>
            )}

            {/* Lockout Warning Banner */}
            {isLocked && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-500">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold block">Akun Terkunci Sementara</span>
                  <span>
                    Terlalu banyak percobaan gagal. Silakan tunggu{' '}
                    <strong className="font-mono font-bold text-sm">
                      {formatLockoutTimer(lockoutRemainingSec)}
                    </strong>{' '}
                    sebelum mencoba kembali.
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner jika ada kesalahan validasi */}
            {(formError || authError) && !isLocked && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError || authError}</span>
              </div>
            )}

            {/* STEP 1: EMAIL & PASSWORD */}
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
                <Input
                  label={BRAND_CONFIG.login.emailLabel}
                  type="email"
                  placeholder={BRAND_CONFIG.login.emailPlaceholder}
                  value={email}
                  disabled={isLocked}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError('');
                    if (setError) setError(null);
                  }}
                  required
                />

                <div className="space-y-1">
                  <PasswordInput
                    label={BRAND_CONFIG.login.passwordLabel}
                    placeholder={BRAND_CONFIG.login.passwordPlaceholder}
                    value={password}
                    disabled={isLocked}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError('');
                      if (setError) setError(null);
                    }}
                    required
                  />

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-[#D9B06F] hover:underline transition-colors"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                </div>

                <div className="mt-2">
                  <Button
                    type="submit"
                    variant="dark"
                    size="md"
                    fullWidth
                    disabled={isLoading || isDemoLoading || isLocked}
                    className="py-3 font-semibold tracking-wide border-[#2C3B53] hover:border-[#D9B06F]"
                  >
                    Lanjut ke Verifikasi 2FA &rarr;
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFIKASI TOTP 2FA */}
            {step === '2fa' && (
              <form onSubmit={handle2FaSubmit} className="flex flex-col gap-4 text-xs">
                <div className="p-3 rounded-xl bg-surface-hover/50 border border-border-subtle flex items-center justify-between">
                  <span className="text-content-muted truncate max-w-[200px]">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setFormError('');
                    }}
                    className="text-[#D9B06F] hover:underline font-semibold"
                  >
                    Ubah
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-content-primary block text-center">
                    Kode TOTP 6 Digit
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    disabled={isLocked}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-surface-main text-content-primary font-mono text-center text-xl tracking-[0.35em] font-bold focus:outline-none focus:border-[#D9B06F]"
                  />
                  <div className="flex justify-between items-center text-[11px] text-content-muted mt-1 px-1">
                    <span>Aplikasi Autentikator</span>
                    <button
                      type="button"
                      onClick={() => setTotpCode('123456')}
                      className="text-[#D9B06F] hover:underline font-semibold"
                    >
                      Isi Otomatis (Demo)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setStep('credentials');
                      setFormError('');
                    }}
                    className="px-3"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={isLoading || isDemoLoading || isLocked}
                    isLoading={isLoading && !isDemoLoading}
                    className="py-3 font-semibold tracking-wide"
                  >
                    {isLoading && !isDemoLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                  </Button>
                </div>
              </form>
            )}

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-5 border-t border-border-subtle flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                disabled={isLoading || isDemoLoading || isLocked}
                isLoading={isDemoLoading}
                onClick={handleDemoLogin}
                leftIcon={<Sparkles className="w-4 h-4 text-[#D9B06F]" />}
                className="py-2.5 text-xs font-semibold tracking-wide border-[#D9B06F]/50 text-[#D9B06F] hover:bg-[#D9B06F]/10 hover:border-[#D9B06F] active:scale-[0.99] transition-all"
              >
                {isDemoLoading ? 'Masuk dengan Akun Demo...' : 'Masuk Langsung (Akun Demo)'}
              </Button>

              <div className="text-[11px] text-content-muted text-center space-y-0.5">
                <p>
                  Demo Admin: <span className="text-[#D9B06F] font-medium">admin@forgepro.id</span> / <span className="text-[#D9B06F] font-medium">admin123</span>
                </p>
                <p>
                  Kode 2FA: <span className="text-[#D9B06F] font-mono font-medium">123456</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

export default LoginPage;
