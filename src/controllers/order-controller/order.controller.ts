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
import type { PrintPayment, PrintPaymentStatus } from '../../types';

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

  public getPrintPayment(orderNumber: string): PrintPayment | undefined {
    return mockDb
      .getState()
      .printPayments.find((p) => p.orderNumber === orderNumber);
  }

  public verifyManualPayment(
    idOrNumber: string,
    googlePlayOrderId: string,
    reason: string
  ): OrderItem | null {
    const target = this.getOrderById(idOrNumber);
    if (!target) return null;

    const trimmedGpa = googlePlayOrderId.trim();
    const updated: OrderItem = {
      ...target,
      paymentStatus: 'Dibayar',
      photoStatus: target.photoStatus === 'Belum mulai' ? 'Diproses' : target.photoStatus,
      googlePlayOrderId: trimmedGpa,
      purchaseToken: target.purchaseToken || `gpa.manual_${Date.now()}`,
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === target.id ? updated : o)),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Verifikasi manual Google Play · ${target.orderNumber} (${trimmedGpa})`,
      result: 'Berhasil',
      targetId: target.orderNumber,
      beforeData: { paymentStatus: target.paymentStatus },
      afterData: { paymentStatus: 'Dibayar', googlePlayOrderId: trimmedGpa, reason },
    });

    mockDb.addInternalOrderNote(
      target.orderNumber,
      `Verifikasi manual Google Play disetujui (${trimmedGpa}). Alasan: ${reason}`,
      'Admin Utama'
    );

    return updated;
  }

  public requestAiRegeneration(
    idOrNumber: string,
    reason: string
  ): OrderItem | null {
    const target = this.getOrderById(idOrNumber);
    if (!target) return null;

    const updated: OrderItem = {
      ...target,
      photoStatus: 'Diproses',
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === target.id ? updated : o)),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'AI',
      activity: `Permintaan render ulang AI (Fal.ai FLUX) · ${target.orderNumber} (Estimasi biaya: Rp4.200)`,
      result: 'Berhasil',
      targetId: target.orderNumber,
      afterData: { reason, photoCount: target.photoCount },
    });

    mockDb.addInternalOrderNote(
      target.orderNumber,
      `Render ulang AI diajukan. Alasan: ${reason}`,
      'Admin Utama'
    );

    return updated;
  }

  public extendDownloadDuration(
    idOrNumber: string,
    daysToAdd: number = 7
  ): OrderItem | null {
    const target = this.getOrderById(idOrNumber);
    if (!target) return null;

    const baseDate = target.downloadExpiresAtIso
      ? new Date(target.downloadExpiresAtIso)
      : new Date();
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    const newExpiresAt = baseDate.toISOString();

    const updated: OrderItem = {
      ...target,
      downloadExpiresAtIso: newExpiresAt,
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === target.id ? updated : o)),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Perpanjangan masa unduh foto · ${target.orderNumber} (+${daysToAdd} hari)`,
      result: 'Berhasil',
      targetId: target.orderNumber,
      afterData: { newExpiresAt },
    });

    return updated;
  }

  public addInternalNote(
    idOrNumber: string,
    note: string,
    author: string = 'Admin Utama'
  ): OrderItem | null {
    const target = this.getOrderById(idOrNumber);
    if (!target) return null;
    return mockDb.addInternalOrderNote(target.orderNumber, note, author) as OrderItem | null;
  }

  public cancelOrder(idOrNumber: string, reason: string): OrderItem | null {
    const target = this.getOrderById(idOrNumber);
    if (!target) return null;

    const updated: OrderItem = {
      ...target,
      photoStatus: 'Dibatalkan',
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === target.id ? updated : o)),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Membatalkan proses pesanan · ${target.orderNumber} (Alasan: ${reason})`,
      result: 'Berhasil',
      targetId: target.orderNumber,
    });

    return updated;
  }

  public syncGooglePlayRefund(
    idOrNumber: string,
    reason: string,
    refundAmount?: number
  ): OrderItem | null {
    const target = this.getOrderById(idOrNumber);
    if (!target) return null;

    const nowIso = new Date().toISOString();
    const amount = refundAmount ?? target.amount;

    const updated: OrderItem = {
      ...target,
      paymentStatus: 'Gagal',
      photoStatus: 'Dibatalkan',
      refundAmount: amount,
      refundReason: reason,
      refundedAtIso: nowIso,
    };

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === target.id ? updated : o)),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Keuangan',
      activity: `Sinkronisasi refund Google Play · ${target.orderNumber} (Rp${amount.toLocaleString('id-ID')})`,
      result: 'Berhasil',
      targetId: target.orderNumber,
      afterData: { refundAmount: amount, reason, nowIso },
    });

    mockDb.addInternalOrderNote(
      target.orderNumber,
      `Refund Google Play diproses: Rp${amount.toLocaleString('id-ID')}. Alasan: ${reason}`,
      'Admin Utama'
    );

    return updated;
  }

  public updatePrintPaymentStatus(
    orderNumber: string,
    status: PrintPaymentStatus
  ): PrintPayment | null {
    const updated = mockDb.updatePrintPayment(orderNumber, { status });
    if (updated) {
      mockDb.updateState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.orderNumber === orderNumber
            ? { ...o, printPaymentStatus: status }
            : o
        ),
      }));
    }
    return updated;
  }

  public extendPrintPaymentDeadline(
    orderNumber: string,
    hoursToAdd: number = 24
  ): PrintPayment | null {
    const current = this.getPrintPayment(orderNumber);
    if (!current) return null;
    const exp = new Date(current.expiresAt);
    exp.setHours(exp.getHours() + hoursToAdd);
    const newExpiresAt = exp.toISOString();

    const updated = mockDb.updatePrintPayment(orderNumber, {
      expiresAt: newExpiresAt,
      status: current.status === 'kedaluwarsa' ? 'menunggu' : current.status,
    });

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Pesanan',
      activity: `Perpanjangan tenggat bayar cetak fisik · ${orderNumber} (+${hoursToAdd} jam)`,
      result: 'Berhasil',
      targetId: orderNumber,
    });

    return updated;
  }

  public refundPrintPayment(
    orderNumber: string,
    reason: string
  ): PrintPayment | null {
    const current = this.getPrintPayment(orderNumber);
    if (!current) return null;

    const updated = mockDb.updatePrintPayment(orderNumber, {
      status: 'refund',
    });

    mockDb.updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.orderNumber === orderNumber
          ? { ...o, printPaymentStatus: 'refund', shippingStatus: 'Antre cetak' }
          : o
      ),
    }));

    mockDb.appendActivityLog({
      source: 'Admin Utama',
      category: 'Keuangan',
      activity: `Refund pembayaran cetak fisik via gateway · ${orderNumber} (Rp${current.totalAmountRp.toLocaleString('id-ID')})`,
      result: 'Berhasil',
      targetId: orderNumber,
      afterData: { reason, provider: current.provider },
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
