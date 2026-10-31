import React, { useState } from 'react';
import { BRAND_CONFIG } from '../../config/branding';

export type LogoVariant = 'horizontal' | 'badge' | 'icon';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: LogoSize;
  showText?: boolean;
}

/**
 * Reusable Logo Component — ForgePro.id
 * Mendukung varian horizontal, badge (stacked), dan icon saja
 * Memiliki fallback SVG otomatis jika file gambar gagal dimuat
 */
export function Logo({
  variant = 'horizontal',
  className = '',
  size = 'md',
  showText = true,
}: LogoProps) {
  const [imgError, setImgError] = useState<boolean>(false);

  const getDimensions = (): string => {
    switch (size) {
      case 'sm':
        return variant === 'horizontal' ? 'h-8' : 'h-10 w-10';
      case 'lg':
        return variant === 'horizontal' ? 'h-14' : 'h-24 w-24';
      case 'xl':
        return variant === 'horizontal' ? 'h-20' : 'h-40 w-40';
      case 'md':
      default:
        return variant === 'horizontal' ? 'h-10' : 'h-16 w-16';
    }
  };

  const imageSrc =
    variant === 'badge'
      ? BRAND_CONFIG.logos.badge
      : BRAND_CONFIG.logos.horizontal;

  if (!imgError && imageSrc) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={imageSrc}
          alt={BRAND_CONFIG.appName}
          className={`${getDimensions()} object-contain select-none`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback SVG Crest / Coat Logo jika gambar tidak ditemukan
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Shield Icon Emblem */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-[#1C273E] to-[#0E1524] border border-[#D9B06F]/40 shadow-sm">
        <svg
          className="w-6 h-6 text-[#D9B06F]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
          <path d="M12 7v7" />
          <path d="M9 10l3 4 3-4" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-baseline">
            <span className="font-serif text-xl font-bold tracking-tight text-content-primary">
              {BRAND_CONFIG.appNamePrefix}
            </span>
            <span className="font-serif text-xl italic font-normal text-[#D9B06F] ml-0.5">
              .{BRAND_CONFIG.appNameSuffix}
            </span>
          </div>
          <span className="text-[9px] font-semibold tracking-[0.2em] text-[#D9B06F] uppercase -mt-0.5">
            {BRAND_CONFIG.tagline}
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;
