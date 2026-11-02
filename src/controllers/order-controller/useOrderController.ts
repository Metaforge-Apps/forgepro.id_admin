import { useState, useEffect, useCallback } from 'react';
import { orderController } from './order.controller';
import {
  OrderItem,
  PaymentStatus,
  PhotoGenerationStatus,
  UpdateOrderStatusPayload,
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

  const updateOrderStatus = useCallback(
    (id: string, payload: UpdateOrderStatusPayload) =>
      orderController.updateOrderStatus(id, payload),
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

  return {
    orders,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getPaymentBadgeStyle,
    getPhotoBadgeStyle,
  };
}

export default useOrderController;
