import { apiRequest, isMockMode } from './apiClient';
import type { VoucherItem, VoucherInput } from '../../controllers/voucher-controller/voucher.types';
import { INITIAL_VOUCHERS } from '../../controllers/voucher-controller/voucher.controller';

export const voucherApi = {
  async getVouchers(): Promise<VoucherItem[]> {
    if (isMockMode()) {
      return [...INITIAL_VOUCHERS];
    }
    const res = await apiRequest<VoucherItem[]>('/vouchers');
    return res.data;
  },

  async createVoucher(input: VoucherInput): Promise<VoucherItem> {
    if (isMockMode()) {
      return {
        ...input,
        id: `v-${Date.now()}`,
        used: 0,
      };
    }
    const res = await apiRequest<VoucherItem>('/vouchers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  },

  async updateVoucher(id: string, input: VoucherInput): Promise<VoucherItem> {
    if (isMockMode()) {
      const found = INITIAL_VOUCHERS.find((v) => v.id === id);
      if (!found) throw new Error('Voucher not found');
      return { ...found, ...input };
    }
    const res = await apiRequest<VoucherItem>(`/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return res.data;
  },

  async deleteVoucher(id: string): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    await apiRequest(`/vouchers/${id}`, { method: 'DELETE' });
    return true;
  },
};

export default voucherApi;
