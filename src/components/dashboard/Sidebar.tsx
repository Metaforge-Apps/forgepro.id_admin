import React from 'react';
import { LogOut, X } from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../config/navigation';
import { SidebarItem } from './SidebarItem';
import { Logo } from '../common/Logo';
import { BRAND_CONFIG } from '../../config/branding';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { useNavigate, useLocation } from 'react-router-dom';

export interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { currentRole } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileActive = location.pathname === '/profil';

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleOpenProfile = () => {
    navigate('/profil');
    if (onClose) onClose();
  };

  const adminName = user?.name || BRAND_CONFIG.defaultAdmin.name;
  const adminInitial =
    user?.avatarInitial || BRAND_CONFIG.defaultAdmin.avatarInitial;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-3 left-3 z-50
          w-[280px] max-w-[88vw]
          flex flex-col
          bg-surface-sidebar
          border border-border-subtle
          rounded-2xl
          shadow-[0_4px_24px_rgba(0,0,0,0.04)]
          px-5 py-6
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex flex-1 justify-center">
            <Logo variant="horizontal" size="lg" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="ml-2 rounded-lg p-1.5 text-content-muted
                       transition-colors hover:bg-surface-hover
                       hover:text-content-primary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Profile Box Sesuai Referensi Figma (Klik untuk membuka Profil Admin Utama) */}
        <div className="mt-5 shrink-0">
          <button
            type="button"
            onClick={handleOpenProfile}
            title="Buka Profil Admin Utama"
            className={`w-full text-left rounded-2xl border px-3.5 py-2.5 flex items-center gap-3 transition-all select-none ${
              isProfileActive
                ? 'border-[#D9B06F] bg-[#D9B06F]/10 shadow-sm'
                : 'border-[#D9B06F]/45 bg-[#F7F5F0]/70 dark:bg-[#1C273E]/50 hover:border-[#D9B06F]'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-[#111A2C] border border-[#D9B06F]/60 flex items-center justify-center font-semibold text-xs text-[#D9B06F] shrink-0">
              {adminInitial}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-content-primary leading-tight truncate">
                {adminName}
              </span>
              <span className="text-[11px] text-[#D9B06F] font-medium leading-tight mt-0.5 truncate">
                {currentRole}
              </span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="mt-5 flex min-h-0 flex-1 flex-col gap-5
                     overflow-y-auto pr-1
                     [scrollbar-width:none]
                     [&::-webkit-scrollbar]:hidden"
        >
          {NAVIGATION_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-1.5">
              <span
                className="mb-1 select-none px-1.5
                           text-[11px] font-semibold uppercase
                           tracking-[0.15em] text-content-muted"
              >
                {section.title}
              </span>

              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    onClick={() => onClose?.()}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3.5
                       rounded-xl px-3.5 py-2.5
                       text-sm font-medium text-[#D9B06F]
                       transition-colors hover:bg-[#D9B06F]/10
                       select-none"
          >
            <LogOut
              className="h-4 w-4 shrink-0 text-[#D9B06F]
                         transition-transform
                         group-hover:-translate-x-0.5"
            />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
