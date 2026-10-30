import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { PrintingShippingPage } from './pages/PrintingShippingPage';
import { SuitCatalogPage } from './pages/SuitCatalogPage';
import { AddSuitPage } from './pages/AddSuitPage';
import { EditSuitPage } from './pages/EditSuitPage';
import { PricingPackagesPage } from './pages/PricingPackagesPage';
import { AddPackagePage } from './pages/AddPackagePage';
import { EditPackagePage } from './pages/EditPackagePage';
import { VouchersPage } from './pages/VouchersPage';
import { AdminManagementPage } from './pages/AdminManagementPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequirePermission } from './components/common/RequirePermission';

/**
 * Route Guard untuk modul admin ForgePro.id
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Redirect root ke /login agar halaman pertama yang muncul adalah Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Halaman Autentikasi Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Halaman Terima Undangan Anggota Tim Admin Baru */}
                <Route path="/terima-undangan" element={<AcceptInvitePage />} />

                {/* Halaman Admin Dashboard Shell */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Halaman Operasional */}
                  <Route
                    path="/pesanan"
                    element={
                      <RequirePermission path="/pesanan">
                        <OrdersPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/cetak-pengiriman"
                    element={
                      <RequirePermission path="/cetak-pengiriman">
                        <PrintingShippingPage />
                      </RequirePermission>
                    }
                  />

                  {/* Halaman Katalog & Produk */}
                  <Route
                    path="/katalog-jas"
                    element={
                      <RequirePermission path="/katalog-jas">
                        <SuitCatalogPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/katalog-jas/tambah"
                    element={
                      <RequirePermission path="/katalog-jas/tambah">
                        <AddSuitPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/katalog-jas/edit"
                    element={
                      <RequirePermission path="/katalog-jas/edit">
                        <EditSuitPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/paket-harga"
                    element={
                      <RequirePermission path="/paket-harga">
                        <PricingPackagesPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/paket-harga/tambah"
                    element={
                      <RequirePermission path="/paket-harga/tambah">
                        <AddPackagePage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/paket-harga/edit"
                    element={
                      <RequirePermission path="/paket-harga/edit">
                        <EditPackagePage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/voucher-promo"
                    element={
                      <RequirePermission path="/voucher-promo">
                        <VouchersPage />
                      </RequirePermission>
                    }
                  />

                  {/* Halaman Sistem & Profil Admin Utama */}
                  <Route
                    path="/manajemen-admin"
                    element={
                      <RequirePermission path="/manajemen-admin">
                        <AdminManagementPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/log-aktivitas"
                    element={
                      <RequirePermission path="/log-aktivitas">
                        <ActivityLogsPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/pengaturan"
                    element={
                      <RequirePermission path="/pengaturan">
                        <SettingsPage />
                      </RequirePermission>
                    }
                  />
                  <Route path="/profil" element={<AdminProfilePage />} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
