import React, { useState, useEffect } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../common/Toast';
import { mockDb } from '../../mocks/db';

export interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal Lupa Kata Sandi Admin ForgePro.id
 * Alur: Email kerja -> Set Kata Sandi Baru (Min 12 Karakter + Kekuatan Sandi) -> Sukses
 */
export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<'email' | 'new-password' | 'success'>('email');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password strength calculation (0 to 100)
  const strength = React.useMemo(() => {
    let score = 0;
    if (newPassword.length >= 12) score += 40;
    else if (newPassword.length >= 8) score += 20;
    if (/[A-Z]/.test(newPassword)) score += 20;
    if (/[0-9]/.test(newPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 20;
    return Math.min(100, score);
  }, [newPassword]);

  const strengthLabel = React.useMemo(() => {
    if (strength >= 80) return { label: 'Sangat Kuat', color: 'text-emerald-500 bg-emerald-500' };
    if (strength >= 60) return { label: 'Kuat', color: 'text-[#D9B06F] bg-[#D9B06F]' };
    if (strength >= 40) return { label: 'Sedang', color: 'text-amber-500 bg-amber-500' };
    return { label: 'Lemah (Minimal 12 Karakter)', color: 'text-rose-500 bg-rose-500' };
  }, [strength]);

  useEffect(() => {
    if (open) {
      setStep('email');
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
    }
  }, [open]);

  if (!open) return null;

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !email.includes('@')) {
      setErrorMsg('Masukkan alamat email kerja yang valid.');
      return;
    }
    showToast('Tautan verifikasi valid. Silakan atur kata sandi baru.', 'info');
    setStep('new-password');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword.length < 12) {
      setErrorMsg('Kata sandi baru wajib minimal 12 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    mockDb.appendActivityLog({
      source: email,
      category: 'Admin',
      activity: `Reset kata sandi berhasil · ${email}`,
      result: 'Berhasil',
      targetId: email,
    });

    setStep('success');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-surface-card border border-border-card shadow-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: INPUT EMAIL */}
        {step === 'email' && (
          <form onSubmit={handleSendLink} className="space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#D9B06F]/10 border border-[#D9B06F]/20 flex items-center justify-center text-[#D9B06F] mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-content-primary">
                Lupa Kata Sandi
              </h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                Masukkan email kerja admin ForgePro.id Anda untuk verifikasi identitas dan membuat kata sandi baru.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-content-primary">
                Email Terdaftar
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@forgepro.id"
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
            >
              <Send className="w-4 h-4" />
              <span>Verifikasi Email &amp; Lanjut</span>
            </button>
          </form>
        )}

        {/* STEP 2: INPUT KATA SANDI BARU */}
        {step === 'new-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-content-primary">
                Buat Kata Sandi Baru
              </h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                Atur kata sandi baru untuk akun <strong className="text-content-primary">{email}</strong>. Minimal 12 karakter.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-content-primary">
                Kata Sandi Baru (Min. 12 Karakter)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 12 karakter..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F]"
              />

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthLabel.color.split(' ')[1]}`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-content-muted">Kekuatan Sandi:</span>
                    <span className={`font-semibold ${strengthLabel.color.split(' ')[0]}`}>
                      {strengthLabel.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-content-primary">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi..."
                className="w-full px-4 py-2.5 rounded-xl border border-border-subtle bg-surface-main text-content-primary text-xs focus:outline-none focus:border-[#D9B06F]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="px-4 py-2.5 rounded-xl font-semibold border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors text-xs inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm text-xs"
              >
                Simpan Kata Sandi Baru
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUKSES */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-content-primary">
                Kata Sandi Berhasil Diperbarui
              </h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed max-w-xs mx-auto">
                Kata sandi baru Anda telah aktif. Anda dapat masuk ke panel admin ForgePro.id menggunakan kata sandi baru.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm text-xs"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
