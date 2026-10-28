import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { X } from 'lucide-react';

interface TransactionItem {
  id: string;
  email: string;
  package: string;
  amount: string;
  status: string;
  time: string;
  photosCount: number;
  paymentMethod: string;
}

const TRANSACTIONS: TransactionItem[] = [
  {
    id: 'PS-261019-001',
    email: 'aditya@mail.com',
    package: 'Profesional',
    amount: 'Rp99.000',
    status: 'Dibayar',
    time: '19 Okt, 16:12',
    photosCount: 20,
    paymentMethod: 'QRIS BCA',
  },
  {
    id: 'PS-261019-002',
    email: 'sari.w@mail.com',
    package: 'Esensial',
    amount: 'Rp59.000',
    status: 'Menunggu',
    time: '19 Okt, 15:48',
    photosCount: 10,
    paymentMethod: 'Virtual Account Mandiri',
  },
  {
    id: 'PS-261019-003',
    email: 'rizky@mail.com',
    package: 'Eksklusif',
    amount: 'Rp169.000',
    status: 'Diproses',
    time: '19 Okt, 15:20',
    photosCount: 35,
    paymentMethod: 'GoPay',
  },
  {
    id: 'PS-261019-004',
    email: 'dewi.a@mail.com',
    package: 'Profesional',
    amount: 'Rp99.000',
    status: 'Dibayar',
    time: '19 Okt, 14:55',
    photosCount: 20,
    paymentMethod: 'Kartu Kredit',
  },
  {
    id: 'PS-261018-001',
    email: 'bayu@mail.com',
    package: 'Esensial',
    amount: 'Rp59.000',
    status: 'Gagal',
    time: '18 Okt, 21:30',
    photosCount: 10,
    paymentMethod: 'ShopeePay (Batas Waktu Habis)',
  },
];

/**
 * Recent Transactions Table Component
 * Sesuai kolom dan baris data transaksi di Figma ForgePro.id
 */
export function RecentTransactionsTable() {
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-content-primary">
          Transaksi terbaru
        </h3>
        <span className="px-3.5 py-1 rounded-full bg-[#F4F1EA] dark:bg-[#1C273E] text-xs font-semibold text-content-primary">
          5 transaksi
        </span>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-content-muted font-semibold tracking-wider text-[11px] uppercase">
              <th className="pb-3.5 pr-4 pl-1">NO. PESANAN</th>
              <th className="pb-3.5 px-4">EMAIL</th>
              <th className="pb-3.5 px-4">PAKET</th>
              <th className="pb-3.5 px-4">NOMINAL</th>
              <th className="pb-3.5 px-4 text-center">STATUS</th>
              <th className="pb-3.5 pl-4 pr-1 text-right">WAKTU (WIB)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {TRANSACTIONS.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="group hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {/* No Pesanan */}
                <td className="py-4 pr-4 pl-1 font-mono text-content-primary font-medium tracking-tight">
                  {tx.id}
                </td>

                {/* Email */}
                <td className="py-4 px-4 text-content-secondary group-hover:text-content-primary transition-colors">
                  {tx.email}
                </td>

                {/* Paket */}
                <td className="py-4 px-4 text-content-secondary">
                  {tx.package}
                </td>

                {/* Nominal */}
                <td className="py-4 px-4 font-medium text-content-primary">
                  {tx.amount}
                </td>

                {/* Status Badge */}
                <td className="py-4 px-4 text-center">
                  <Badge status={tx.status} />
                </td>

                {/* Waktu */}
                <td className="py-4 pl-4 pr-1 text-right text-content-muted">
                  {tx.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Transaksi saat baris diklik */}
      {selectedTx && (
        <div
          onClick={() => setSelectedTx(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface-card border border-[#D9B06F]/40 p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-[#D9B06F] font-semibold">
                {selectedTx.id}
              </span>
              <Badge status={selectedTx.status} size="sm" />
            </div>

            <h4 className="font-serif text-xl font-bold text-content-primary mb-1">
              Detail Transaksi
            </h4>
            <p className="text-xs text-content-muted mb-5">
              Data pesanan pemotretan AI ForgePro.id
            </p>

            <div className="space-y-3 text-xs divide-y divide-border-subtle">
              <div className="flex justify-between pt-2">
                <span className="text-content-muted">Pelanggan</span>
                <span className="font-medium text-content-primary">
                  {selectedTx.email}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-content-muted">Pilihan Paket</span>
                <span className="font-medium text-content-primary">
                  {selectedTx.package}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-content-muted">Total Pembayaran</span>
                <span className="font-bold text-[#D9B06F] text-sm">
                  {selectedTx.amount}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-content-muted">Metode Pembayaran</span>
                <span className="font-medium text-content-primary">
                  {selectedTx.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-content-muted">Estimasi Hasil Foto</span>
                <span className="font-medium text-content-primary">
                  {selectedTx.photosCount} Variasi Foto Jas
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-content-muted">Waktu Transaksi</span>
                <span className="font-medium text-content-primary">
                  {selectedTx.time} WIB
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#D9B06F] text-[#0A111C] hover:bg-[#E5C285]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default RecentTransactionsTable;
