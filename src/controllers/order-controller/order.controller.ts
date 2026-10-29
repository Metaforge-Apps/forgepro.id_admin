import {
  OrderItem,
  PaymentStatus,
  PhotoGenerationStatus,
  ShippingStatus,
  UpdateOrderStatusPayload,
  UpdateShippingPayload,
} from './order.types';
import { INITIAL_ORDERS } from './order.seed';

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

  public getPhysicalPrintOrders(): OrderItem[] {
    return this.orders.filter((o) => o.hasPhysicalPrint);
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

    if (updated) this.notify();
    return updated;
  }

  public updateShipping(
    id: string,
    payload: UpdateShippingPayload
  ): OrderItem | null {
    let updated: OrderItem | null = null;
    this.orders = this.orders.map((o) => {
      if (o.id !== id && o.orderNumber !== id) return o;
      updated = {
        ...o,
        shippingStatus: payload.shippingStatus ?? o.shippingStatus,
        shippingTrackingNumber:
          payload.shippingTrackingNumber !== undefined
            ? payload.shippingTrackingNumber.trim()
            : o.shippingTrackingNumber,
        shippingCourier: payload.shippingCourier ?? o.shippingCourier,
      };
      return updated;
    });

    if (updated) this.notify();
    return updated;
  }

  public deleteOrder(id: string): boolean {
    const prevLen = this.orders.length;
    this.orders = this.orders.filter((o) => o.id !== id && o.orderNumber !== id);
    const deleted = this.orders.length < prevLen;
    if (deleted) this.notify();
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

  public getShippingBadgeStyle(status: ShippingStatus): string {
    if (status === 'Antre cetak') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
    if (status === 'Dicetak' || status === 'Siap dikirim' || status === 'Dikirim') {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  }
}

export const orderController = new OrderController();
export default orderController;
