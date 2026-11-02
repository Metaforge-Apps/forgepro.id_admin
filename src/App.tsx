import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root ke /login agar halaman pertama yang muncul adalah Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Halaman Autentikasi Login */}
            <Route path="/login" element={<LoginPage />} />

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
              <Route path="/pesanan" element={<OrdersPage />} />
              <Route path="/cetak-pengiriman" element={<Navigate to="/pesanan" replace />} />

              {/* Halaman Katalog & Produk (Dikelola oleh style-controller & package-controller) */}
              <Route path="/katalog-jas" element={<SuitCatalogPage />} />
              <Route path="/katalog-jas/tambah" element={<AddSuitPage />} />
              <Route path="/katalog-jas/edit" element={<EditSuitPage />} />
              <Route path="/paket-harga" element={<PricingPackagesPage />} />
              <Route path="/paket-harga/tambah" element={<AddPackagePage />} />
              <Route path="/paket-harga/edit" element={<EditPackagePage />} />
              <Route path="/voucher-promo" element={<VouchersPage />} />

              {/* Halaman Sistem & Profil Admin Utama */}
              <Route path="/manajemen-admin" element={<AdminManagementPage />} />
              <Route path="/log-aktivitas" element={<ActivityLogsPage />} />
              <Route path="/pengaturan" element={<SettingsPage />} />
              <Route path="/profil" element={<AdminProfilePage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
