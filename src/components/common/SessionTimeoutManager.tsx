import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';

// Default: 30 menit sesi (1800 detik), peringatan di 60 detik terakhir
const SESSION_DURATION_MS = 30 * 60 * 1000;
const WARNING_THRESHOLD_MS = 60 * 1000;

/**
 * Pengelola Batas Waktu Sesi Admin (Fase 7: Item 37)
 * - Otomatis mendeteksi inaktivitas user selama 30 menit
 * - Memunculkan modal hitung mundur 60 detik sebelum sesi berakhir
 * - Memberikan tombol "Perpanjang Sesi" atau "Keluar Sekarang"
 */
export function SessionTimeoutManager() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  const lastActivityRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const recordActivity = useCallback(() => {
    if (!showWarning) {
      lastActivityRef.current = Date.now();
    }
  }, [showWarning]);

  const handleExtendSession = () => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(60);
    showToast('Sesi panel admin berhasil diperpanjang 30 menit', 'success');
  };

  const handleForceLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    navigate('/login?reason=session_expired');
    showToast('Sesi Anda telah diakhiri demi keamanan', 'info');
  }, [logout, navigate, showToast]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, recordActivity));

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - (lastActivityRef.current || Date.now());
      const remainingMs = SESSION_DURATION_MS - elapsed;

      if (remainingMs <= 0) {
        // Auto logout
        handleForceLogout();
      } else if (remainingMs <= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, recordActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated, recordActivity, handleForceLogout]);

  if (!isAuthenticated || !showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl bg-surface-card border border-border-card shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-content-primary">
              Sesi Anda Akan Segera Berakhir
            </h3>
            <span className="text-[11px] text-content-muted">
              Kebijakan Keamanan ForgePro.id (Sesi 30 Menit)
            </span>
          </div>
        </div>

        <p className="text-xs text-content-muted leading-relaxed">
          Tidak ada aktivitas yang terdeteksi. Sesi Anda akan otomatis diakhiri dalam kurun waktu{' '}
          <strong className="text-amber-500 font-bold font-mono text-sm">
            {secondsRemaining} detik
          </strong>{' '}
          demi mencegah akses tidak berizin.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleForceLogout}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-border-subtle hover:bg-surface-hover text-content-primary transition-colors inline-flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sekarang</span>
          </button>

          <button
            type="button"
            onClick={handleExtendSession}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285] transition-all shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Perpanjang Sesi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeoutManager;
