import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NavigationItem } from '../../types';

export interface SidebarItemProps {
  item: NavigationItem;
  onClick?: () => void;
}

/**
 * Sidebar Single Navigation Item
 */
export function SidebarItem({ item, onClick }: SidebarItemProps) {
  const iconMap = Icons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const IconComponent = iconMap[item.icon] || Icons.Circle;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      end={item.exact}
      className={({ isActive }) => `
        group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 select-none
        ${
          isActive
            ? 'bg-surface-active text-content-primary border border-border-active shadow-sm font-semibold'
            : 'text-content-muted hover:text-content-primary hover:bg-surface-hover border border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <IconComponent
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive
                ? 'text-[#D9B06F]'
                : 'text-content-muted group-hover:text-content-primary'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default SidebarItem;
