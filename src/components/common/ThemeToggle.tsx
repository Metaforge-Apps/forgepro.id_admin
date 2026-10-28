import React from 'react';
import { Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Theme Toggle Button Component
 * Sesuai bentuk pill di header Figma dashboard: [ ☼ Light ] / [ ☾ Dark ]
 */
export function ThemeToggle({
  className = '',
  showLabel = true,
}: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Beralih ke mode ${isDark ? 'Terang (Light)' : 'Gelap (Dark)'}`}
      aria-label="Toggle theme"
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-medium
        transition-all duration-200 select-none
        border border-[#D9B06F]/80 hover:border-[#D9B06F]
        ${
          isDark
            ? 'bg-[#292F45] text-[#F7F5F0]'
            : 'bg-[#F7F5F0] text-[#0A111C]'
        }
        shadow-sm active:scale-95
        ${className}
      `}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-[#D9B06F]" />
          {showLabel && <span>Dark</span>}
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-[#D9B06F]" />
          {showLabel && <span>Light</span>}
        </>
      )}
    </button>
  );
}

export default ThemeToggle;
