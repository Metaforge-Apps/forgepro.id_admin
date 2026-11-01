import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

export interface PlaceholderPageProps {
  title: string;
  description?: string;
  category?: string;
}

export function PlaceholderPage({ title, description, category }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#D9B06F]/10 border border-[#D9B06F]/30 flex items-center justify-center text-[#D9B06F] mb-4">
          <Construction className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold tracking-[0.2em] text-[#D9B06F] uppercase mb-1">
          {category || 'MODUL FORGEPRO.ID'}
        </span>

        <h2 className="font-serif text-2xl md:text-3xl font-bold text-content-primary mb-2">
          {title}
        </h2>

        <p className="text-sm text-content-muted max-w-md mb-6">
          {description ||
            `Halaman ${title} sedang dalam pengembangan operasional ForgePro.id.`}
        </p>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Kembali ke Dashboard
        </Button>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
