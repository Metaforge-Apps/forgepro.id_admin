import {
  OrderItem,
  PaymentStatus,
  PhotoGenerationStatus,
  UpdateOrderStatusPayload,
} from './order.types';
import { INITIAL_ORDERS } from './order.seed';
import { activityController } from '../activity-controller/activity.controller';

const STORAGE_KEY = 'forgepro_orders_v3';

type OrderListener = () => void;

export class OrderController {
  private orders: OrderItem[];
  private listeners: Set<OrderListener> = new Set();

  constructor() {
    this.orders = this.loadFromStorage();
  }

  private loadFromStorage(): OrderItem[] {
    if (typeof window === 'undefined') return [...INITIAL_ORDERS];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as OrderItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_ORDERS];
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.orders));
    } catch {
      // Ignore quota
    }
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: OrderListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAllOrders(): OrderItem[] {
    return [...this.orders];
  }

  public getOrderById(id: string): OrderItem | undefined {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public updateOrderStatus(
    id: string,
    payload: UpdateOrderStatusPayload
  ): OrderItem | null {
    let updated: OrderItem | null = null;
    this.orders = this.orders.map((o) => {
      if (o.id !== id && o.orderNumber !== id) return o;
      updated = {
        ...o,
        paymentStatus: payload.paymentStatus ?? o.paymentStatus,
        photoStatus: payload.photoStatus ?? o.photoStatus,
        creditsRemaining: payload.creditsRemaining ?? o.creditsRemaining,
      };
      return updated;
    });

    if (updated) {
      const orderRef: OrderItem = updated;
      this.notify();
      activityController.logActivity({
        source: 'Admin Operasional',
        category: 'Pesanan',
        activity: `Status pesanan ${orderRef.orderNumber} diperbarui (Bayar: ${orderRef.paymentStatus}, Foto: ${orderRef.photoStatus})`,
        result: 'Berhasil',
      });
    }
    return updated;
  }

  public deleteOrder(id: string): boolean {
    const prevLen = this.orders.length;
    const target = this.orders.find((o) => o.id === id || o.orderNumber === id);
    this.orders = this.orders.filter((o) => o.id !== id && o.orderNumber !== id);
    const deleted = this.orders.length < prevLen;
    if (deleted) {
      this.notify();
      if (target) {
        activityController.logActivity({
          source: 'Admin Utama',
          category: 'Pesanan',
          activity: `Menghapus data pesanan ${target.orderNumber}`,
          result: 'Berhasil',
        });
      }
    }
    return deleted;
  }

  public resetOrders(): OrderItem[] {
    this.orders = [...INITIAL_ORDERS];
    this.notify();
    return this.getAllOrders();
  }

  public getPaymentBadgeStyle(status: PaymentStatus): string {
    if (status === 'Dibayar') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (status === 'Menunggu') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  }

  public getPhotoBadgeStyle(status: PhotoGenerationStatus): string {
    if (status === 'Selesai') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
    if (status === 'Diproses') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }

  public exportOrdersCSV(): void {
    const headers = [
      'ID',
      'No. Pesanan',
      'Waktu',
      'Email Pelanggan',
      'Nama Pelanggan',
      'Paket',
      'Jumlah Foto',
      'Total (IDR)',
      'Status Pembayaran',
      'Status Foto AI',
      'Metode Bayar',
    ];
    const rows = this.orders.map((o) => [
      o.id,
      `"${o.orderNumber}"`,
      `"${o.timeDisplay}"`,
      `"${o.customerEmail}"`,
      `"${o.customerName || '-'}"`,
      `"${o.packageName}"`,
      o.photoCount,
      o.amount,
      `"${o.paymentStatus}"`,
      `"${o.photoStatus}"`,
      `"${o.paymentMethod}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `forgepro-orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    activityController.logActivity({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Mengekspor ${this.orders.length} data pesanan ke CSV`,
      result: 'Berhasil',
    });
  }
}

export const orderController = new OrderController();
export default orderController;
