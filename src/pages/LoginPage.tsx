import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_CONFIG } from '../config/branding';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { Logo } from '../components/common/Logo';
import { AlertCircle } from 'lucide-react';

/**
 * Login Page Component
 * Mengimplementasikan split-screen login sesuai aset Figma ForgePro.id
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, setError } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Alamat email wajib diisi.');
      return;
    }

    if (!password) {
      setFormError('Password wajib diisi.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal masuk akun admin.';
      setFormError(message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F7F5F0] dark:bg-[#0A111C] light:bg-[#FFFFFF] text-content-primary relative overflow-hidden transition-colors duration-200">
      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      {/* SISI KIRI: Foto Hero 5 Profesional Berjas Sesuai Figma */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0A111C]">
        <img
          src={BRAND_CONFIG.logos.loginHero}
          alt="ForgePro.id Professional Team"
          className="w-full h-full object-cover object-center select-none"
        />
        {/* Subtle vignette/gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A111C]/30 pointer-events-none" />
      </div>

      {/* SISI KANAN: Form Login Admin */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 bg-surface-main lg:bg-transparent">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          {/* Logo Badge di Atas Kotak Login */}
          <div className="mb-5 flex flex-col items-center">
            <Logo variant="badge" size="xl" className="w-32 h-32 sm:w-32 sm:h-32 rounded-2xl" />
          </div>

          {/* Kartu Form Login */}
          <div className="w-full rounded-2xl p-7 sm:p-9 bg-surface-card border border-border-card shadow-2xl transition-all">
            {/* Header Form */}
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[#D9B06F]">
                {BRAND_CONFIG.login.title}
              </h2>
              <p className="text-xs text-content-muted mt-1.5">
                {BRAND_CONFIG.login.subtitle}
              </p>
            </div>

            {/* Error Banner jika ada kesalahan validasi */}
            {(formError || authError) && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError || authError}</span>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label={BRAND_CONFIG.login.emailLabel}
                type="email"
                placeholder={BRAND_CONFIG.login.emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError('');
                  if (setError) setError(null);
                }}
                required
              />

              <PasswordInput
                label={BRAND_CONFIG.login.passwordLabel}
                placeholder={BRAND_CONFIG.login.passwordPlaceholder}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError('');
                  if (setError) setError(null);
                }}
                required
              />

              {/* Tombol Masuk bergaya Figma */}
              <div className="mt-2">
                <Button
                  type="submit"
                  variant="dark"
                  size="md"
                  fullWidth
                  isLoading={isLoading}
                  className="py-3 font-semibold tracking-wide border-[#2C3B53] hover:border-[#D9B06F]"
                >
                  {isLoading
                    ? BRAND_CONFIG.login.submitLoading
                    : BRAND_CONFIG.login.submitButton}
                </Button>
              </div>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-5 border-t border-border-subtle text-center">
              <p className="text-[11px] text-content-muted">
                Demo Akun: <span className="text-[#D9B06F] font-medium">admin@forgepro.id</span> / <span className="text-[#D9B06F] font-medium">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
