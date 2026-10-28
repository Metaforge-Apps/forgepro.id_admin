import React from 'react';
import { Card } from '../common/Card';

interface TopPackageItem {
  name: string;
  price: string;
  percentage: number;
}

const PACKAGES: TopPackageItem[] = [
  {
    name: 'Esensial',
    price: 'Rp59.000',
    percentage: 28,
  },
  {
    name: 'Profesional',
    price: 'Rp99.000',
    percentage: 54,
  },
  {
    name: 'Eksklusif',
    price: 'Rp169.000',
    percentage: 18,
  },
];

/**
 * Top Performing Packages Component
 * Menampilkan 3 paket terlaris dengan progress bar emas
 */
export function TopPackages() {
  return (
    <Card className="flex flex-col justify-start">
      <h3 className="text-base sm:text-lg font-semibold tracking-tight text-content-primary mb-5">
        Paket terlaris
      </h3>

      <div className="flex flex-col gap-5">
        {PACKAGES.map((pkg) => (
          <div key={pkg.name} className="flex flex-col gap-2">
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
                style={{ width: `${pkg.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TopPackages;
