import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, Sparkles, AlertCircle, Info, Truck } from 'lucide-react';
import { useCentralStore } from '../../mocks/selectors';
import type { AdminNotificationItem } from '../../types';

export function NotificationBell() {
  const navigate = useNavigate();
  const { state, updateState } = useCentralStore();
  const notifications = state.notifications || [];

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-hover border border-border-subtle transition-colors"
        title="Pusat Notifikasi Admin"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-card border border-border-card shadow-2xl z-50 overflow-hidden animate-fade-in flex flex-col">
          {/* Header */}
          <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-content-primary">Notifikasi Sistem</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#D9B06F] hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border-subtle/50">
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
      )}
    </div>
  );
}

export default NotificationBell;
