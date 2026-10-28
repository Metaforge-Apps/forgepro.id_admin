import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
}

/**
 * Reusable Card Component
 * Mengikuti radius, border, dan background kartu di dashboard Figma ForgePro.id
 */
export function Card({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl transition-all duration-200
        bg-surface-card
        border border-border-card
        text-content-primary
        shadow-sm
        ${hover ? 'hover:border-[#D9B06F]/60 hover:shadow-md cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
