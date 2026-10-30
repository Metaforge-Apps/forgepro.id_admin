import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { mockDb } from '../mocks/db';

/**
 * Halaman Terima Undangan Admin Baru ForgePro.id
 * Alur: Set Profil & Password Baru (min 12 chars + strength) -> Aktivasi Akun Selesai
 */
export function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'INV-202610-DEMO';
  const inviteEmail = searchParams.get('email') || 'staf.baru@forgepro.id';

  const { login } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('Staf Baru ForgePro');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    mockDb.appendActivityLog({
      source: inviteEmail,
      category: 'Admin',
      activity: `Aktivasi undangan admin selesai · ${name} (${inviteEmail})`,
      result: 'Berhasil',
      targetId: token,
    });

    setStep(2);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    showToast('Pendaftaran akun admin selesai! Mengalihkan ke dashboard...', 'success');
    try {
      await login('admin@forgepro.id', 'admin123');
      navigate('/dashboard');
    } catch {
      navigate('/login');
    } finally {
      setIsSubmitting(false);
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
            <span className={`font-semibold ${step === 1 ? 'text-[#D9B06F]' : 'text-emerald-500 flex items-center gap-1'}`}>
              {step === 2 && <CheckCircle2 className="w-3.5 h-3.5" />}
              1. Lengkapi Kata Sandi
            </span>
            <span className="text-content-muted">&rarr;</span>
            <span className={`font-semibold ${step === 2 ? 'text-[#D9B06F]' : 'text-content-muted'}`}>
              2. Aktivasi Selesai
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
                  Selamat datang di panel admin ForgePro.id. Silakan lengkapi nama Anda dan buat kata sandi aman.
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
                <span>Aktifkan Akun &amp; Selesai</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: AKTIVASI SELESAI */}
          {step === 2 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                <UserCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-semibold text-content-primary">
                  Akun Admin Aktif!
                </h3>
                <p className="text-xs text-content-muted mt-1.5 leading-relaxed max-w-sm mx-auto">
                  Selamat <strong className="text-content-primary">{name}</strong>, akun admin Anda ({inviteEmail}) telah berhasil dibuat dan siap digunakan untuk mengelola panel web ForgePro.id.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses...' : 'Masuk ke Panel Dashboard'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcceptInvitePage;
