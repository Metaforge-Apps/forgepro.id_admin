import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, AlertCircle, Info, X } from 'lucide-react';
import { useCentralStore } from '../../mocks/selectors';
import type { AdminNotificationItem } from '../../types';

export function NotificationBell() {
  const navigate = useNavigate();
  const { state, updateState } = useCentralStore();
  const notifications = state.notifications || [];

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click (mouse or touch) or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    updateState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleClickNotification = (notif: AdminNotificationItem) => {
    updateState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === notif.id ? { ...n, read: true } : n
      ),
    }));
    setIsOpen(false);
    navigate(notif.targetPath);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors border ${
          isOpen
            ? 'bg-surface-hover text-content-primary border-border-card'
            : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover border-border-subtle'
        }`}
        title="Pusat Notifikasi Admin"
        aria-label="Pusat Notifikasi Admin"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop gelap khusus Mobile / Handphone */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Popup Container: Responsive Fixed Modal di Handphone, Absolute Dropdown di Laptop/Desktop */}
          <div
            className="fixed inset-x-3.5 top-16 max-w-md mx-auto z-50 sm:inset-x-auto sm:max-w-none sm:mx-0 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-96 rounded-2xl bg-surface-card border border-border-card shadow-2xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[500px] animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-card sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-content-primary">Notifikasi Sistem</span>
                {unreadCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                    {unreadCount} baru
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
                    Semua dibaca
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-[#D9B06F] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Tandai semua dibaca</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
                  title="Tutup Notifikasi"
                  aria-label="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/50 overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-content-muted">
                  Tidak ada notifikasi aktif.
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleClickNotification(notif)}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 hover:bg-surface-hover ${
                      !notif.read ? 'bg-[#D9B06F]/5' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">{getSeverityIcon(notif.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${!notif.read ? 'font-bold text-content-primary' : 'text-content-primary'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-content-muted shrink-0">{notif.timeWib}</span>
                      </div>
                      <p className="text-[11px] text-content-muted line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#D9B06F] shrink-0 mt-1" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
