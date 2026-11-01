import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderController } from './order.controller';
import {
  OrderItem,
  PaymentStatus,
  PhotoGenerationStatus,
  ShippingStatus,
  UpdateOrderStatusPayload,
  UpdateShippingPayload,
} from './order.types';
import type { PrintPaymentStatus } from '../../types';

export function useOrderController() {
  const [orders, setOrders] = useState<OrderItem[]>(() =>
    orderController.getAllOrders()
  );

  useEffect(() => {
    const unsubscribe = orderController.subscribe(() => {
      setOrders(orderController.getAllOrders());
    });
    return unsubscribe;
  }, []);

  const physicalPrintOrders = useMemo(
    () => orders.filter((o) => o.hasPhysicalPrint),
    [orders]
  );

  const updateOrderStatus = useCallback(
    (id: string, payload: UpdateOrderStatusPayload) =>
      orderController.updateOrderStatus(id, payload),
    []
  );

  const updateShipping = useCallback(
    (id: string, payload: UpdateShippingPayload) =>
      orderController.updateShipping(id, payload),
    []
  );

  const deleteOrder = useCallback(
    (id: string) => orderController.deleteOrder(id),
    []
  );

  const getOrderById = useCallback(
    (id: string) => orderController.getOrderById(id),
    []
  );

  const getPrintPayment = useCallback(
    (orderNumber: string) => orderController.getPrintPayment(orderNumber),
    []
  );

  const verifyManualPayment = useCallback(
    (idOrNumber: string, googlePlayOrderId: string, reason: string) =>
      orderController.verifyManualPayment(idOrNumber, googlePlayOrderId, reason),
    []
  );

  const requestAiRegeneration = useCallback(
    (idOrNumber: string, reason: string) =>
      orderController.requestAiRegeneration(idOrNumber, reason),
    []
  );

  const extendDownloadDuration = useCallback(
    (idOrNumber: string, daysToAdd: number = 7) =>
      orderController.extendDownloadDuration(idOrNumber, daysToAdd),
    []
  );

  const addInternalNote = useCallback(
    (idOrNumber: string, note: string, author?: string) =>
      orderController.addInternalNote(idOrNumber, note, author),
    []
  );

  const cancelOrder = useCallback(
    (idOrNumber: string, reason: string) =>
      orderController.cancelOrder(idOrNumber, reason),
    []
  );

  const syncGooglePlayRefund = useCallback(
    (idOrNumber: string, reason: string, refundAmount?: number) =>
      orderController.syncGooglePlayRefund(idOrNumber, reason, refundAmount),
    []
  );

  const updatePrintPaymentStatus = useCallback(
    (orderNumber: string, status: PrintPaymentStatus) =>
      orderController.updatePrintPaymentStatus(orderNumber, status),
    []
  );

  const extendPrintPaymentDeadline = useCallback(
    (orderNumber: string, hoursToAdd: number = 24) =>
      orderController.extendPrintPaymentDeadline(orderNumber, hoursToAdd),
    []
  );

  const refundPrintPayment = useCallback(
    (orderNumber: string, reason: string) =>
      orderController.refundPrintPayment(orderNumber, reason),
    []
  );

  const getPaymentBadgeStyle = useCallback(
    (status: PaymentStatus) => orderController.getPaymentBadgeStyle(status),
    []
  );

  const getPhotoBadgeStyle = useCallback(
    (status: PhotoGenerationStatus) => orderController.getPhotoBadgeStyle(status),
    []
  );

  const getShippingBadgeStyle = useCallback(
    (status: ShippingStatus) => orderController.getShippingBadgeStyle(status),
    []
  );

  return {
    orders,
    physicalPrintOrders,
    updateOrderStatus,
    updateShipping,
    deleteOrder,
    getOrderById,
    getPrintPayment,
    verifyManualPayment,
    requestAiRegeneration,
    extendDownloadDuration,
    addInternalNote,
    cancelOrder,
    syncGooglePlayRefund,
    updatePrintPaymentStatus,
    extendPrintPaymentDeadline,
    refundPrintPayment,
    getPaymentBadgeStyle,
    getPhotoBadgeStyle,
    getShippingBadgeStyle,
  };
}

export default useOrderController;
