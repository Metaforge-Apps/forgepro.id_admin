import { apiRequest, isMockMode, ApiResponse } from './apiClient';
import type { OrderItem, UpdateOrderStatusPayload } from '../../controllers/order-controller/order.types';
import { INITIAL_ORDERS } from '../../controllers/order-controller/order.seed';

export const orderApi = {
  async getOrders(): Promise<OrderItem[]> {
    if (isMockMode()) {
      return [...INITIAL_ORDERS];
    }
    const res = await apiRequest<OrderItem[]>('/orders');
    return res.data;
  },

  async getOrderById(id: string): Promise<OrderItem> {
    if (isMockMode()) {
      const found = INITIAL_ORDERS.find((o) => o.id === id || o.orderNumber === id);
      if (!found) throw new Error('Order not found');
      return found;
    }
    const res = await apiRequest<OrderItem>(`/orders/${id}`);
    return res.data;
  },

  async updateOrderStatus(
    id: string,
    payload: UpdateOrderStatusPayload
  ): Promise<OrderItem> {
    if (isMockMode()) {
      const found = INITIAL_ORDERS.find((o) => o.id === id || o.orderNumber === id);
      if (!found) throw new Error('Order not found');
      return { ...found, ...payload };
    }
    const res = await apiRequest<OrderItem>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};

export default orderApi;
