import {
  OrderItem,
  PaymentStatus,
  PhotoGenerationStatus,
  ShippingStatus,
  UpdateOrderStatusPayload,
  UpdateShippingPayload,
} from './order.types';
import { mockDb } from '../../mocks/db';
import {
  canTransitionShippingStatus,
  validateOrderStateCombination,
} from '../../config/business';
import { getStatusBadgeClasses } from '../../config/statusColors';

type OrderListener = () => void;

export class OrderController {
  public subscribe(listener: OrderListener): () => void {
    return mockDb.subscribe(listener);
  }

  public getAllOrders(): OrderItem[] {
    return [...mockDb.getState().orders];
  }

  public getOrderById(id: string): OrderItem | undefined {
    return mockDb
      .getState()
      .orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public getPhysicalPrintOrders(): OrderItem[] {
    return mockDb.getState().orders.filter((o) => o.hasPhysicalPrint);
  }

  public updateOrderStatus(
    id: string,
    payload: UpdateOrderStatusPayload
  ): OrderItem | null {
    const currentOrders = mockDb.getState().orders;
    const target = currentOrders.find(
      (o) => o.id === id || o.orderNumber === id
    );
    if (!target) return null;

    const nextPayment: PaymentStatus =
      payload.paymentStatus ?? target.paymentStatus;
    let nextPhoto: PhotoGenerationStatus =
      payload.photoStatus ?? target.photoStatus;

    // Jika pembayaran berubah menjadi Gagal, proses foto otomatis Dibatalkan
    if (payload.paymentStatus === 'Gagal' && !payload.photoStatus) {
      nextPhoto = 'Dibatalkan';
    } else if (
      payload.paymentStatus === 'Menunggu' &&
      !payload.photoStatus &&
      (nextPhoto === 'Diproses' || nextPhoto === 'Selesai')
    ) {
      nextPhoto = 'Belum mulai';
    }

    // Validasi kombinasi status (Fase 0: 0.7 — tidak boleh Menunggu/Gagal tapi Selesai/Diproses)
    const comboCheck = validateOrderStateCombination(nextPayment, nextPhoto);
    if (!comboCheck.valid) {
      nextPhoto = nextPayment === 'Gagal' ? 'Dibatalkan' : 'Belum mulai';
    }

    const updated: OrderItem = {
      ...target,
      paymentStatus: nextPayment,
      photoStatus: nextPhoto,
      creditsRemaining: payload.creditsRemaining ?? target.creditsRemaining,
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === target.id ? updated : o
      ),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Memperbarui status pesanan · ${updated.orderNumber} (${updated.paymentStatus} / ${updated.photoStatus})`,
      result: 'Berhasil',
      targetId: updated.orderNumber,
      beforeData: {
        paymentStatus: target.paymentStatus,
        photoStatus: target.photoStatus,
      },
      afterData: {
        paymentStatus: updated.paymentStatus,
        photoStatus: updated.photoStatus,
      },
    });

    return updated;
  }

  public updateShipping(
    id: string,
    payload: UpdateShippingPayload
  ): OrderItem | null {
    const currentOrders = mockDb.getState().orders;
    const target = currentOrders.find(
      (o) => o.id === id || o.orderNumber === id
    );
    if (!target) return null;

    const currentShip = target.shippingStatus ?? 'Antre cetak';
    const nextShip = payload.shippingStatus ?? currentShip;
    if (!canTransitionShippingStatus(currentShip, nextShip)) {
      // Tetap izinkan koreksi manual admin di panel
    }

    const updated: OrderItem = {
      ...target,
      shippingStatus: nextShip,
      shippingTrackingNumber:
        payload.shippingTrackingNumber !== undefined
          ? payload.shippingTrackingNumber.trim()
          : target.shippingTrackingNumber,
      shippingCourier: payload.shippingCourier ?? target.shippingCourier,
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === target.id ? updated : o
      ),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Memperbarui pengiriman cetak · ${updated.orderNumber} (${updated.shippingStatus})`,
      result: 'Berhasil',
      targetId: updated.orderNumber,
    });

    return updated;
  }

  public deleteOrder(id: string): boolean {
    const exists = mockDb
      .getState()
      .orders.some((o) => o.id === id || o.orderNumber === id);
    if (!exists) return false;
    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== id && o.orderNumber !== id),
    }));
    return true;
  }

  public resetOrders(): OrderItem[] {
    return mockDb.resetToSeed().orders;
  }

  public getPaymentBadgeStyle(status: PaymentStatus): string {
    return getStatusBadgeClasses(status);
  }

  public getPhotoBadgeStyle(status: PhotoGenerationStatus): string {
    return getStatusBadgeClasses(status);
  }

  public getShippingBadgeStyle(status: ShippingStatus): string {
    return getStatusBadgeClasses(status);
  }
}

export const orderController = new OrderController();
export default orderController;
