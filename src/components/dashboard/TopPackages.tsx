import React from 'react';
import { Card } from '../common/Card';
import { usePackageController } from '../../controllers/package-controller';

/**
 * Top Performing Packages Component
 * Terhubung dengan packageController sehingga langsung reaktif terhadap perubahan paket & harga
 */
export function TopPackages() {
  const { packages } = usePackageController();

  const topPackages = packages
    .filter((p) => p.status === 'Tayang')
    .map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      percentage: parseInt(pkg.salesShare.replace('%', ''), 10) || 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <Card className="flex flex-col justify-start">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-content-primary">
          Paket terlaris
        </h3>
        <span className="text-xs text-content-muted">
          Berdasarkan pangsa pesanan
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {topPackages.map((pkg) => (
          <div key={pkg.id} className="flex flex-col gap-2">
            {/* Header: Nama Paket dan Harga · Persentase */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-serif text-base font-medium text-content-primary">
                {pkg.name}
              </span>
              <span className="text-content-muted font-normal text-xs">
                {pkg.price} <span className="mx-0.5">·</span> {pkg.percentage}%
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#1F2C44] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#D9B06F] transition-all duration-700 ease-out"
                style={{ width: `${Math.min(pkg.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
        {topPackages.length === 0 && (
          <p className="text-xs text-content-muted py-4">Belum ada paket yang aktif.</p>
        )}
      </div>
    </Card>
  );
}

export default TopPackages;
