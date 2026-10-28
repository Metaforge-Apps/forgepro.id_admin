import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';

/**
 * Dashboard Shell Layout
 * Menampung Sidebar tetap di kiri dan area konten utama di kanan
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-surface-main text-content-primary flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] w-full mx-auto">
          {/* Header Dashboard */}
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Child Page Content */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
