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
    getPaymentBadgeStyle,
    getPhotoBadgeStyle,
    getShippingBadgeStyle,
  };
}

export default useOrderController;
