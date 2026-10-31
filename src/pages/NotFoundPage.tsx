import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-main text-content-primary">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-7xl font-bold text-[#D9B06F] mb-4">404</h1>
        <h2 className="font-serif text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-content-muted mb-6">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
