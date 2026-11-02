import { apiRequest, isMockMode } from './apiClient';
import type {
  PricingPackageItem,
  UpdatePackagePayload,
} from '../../controllers/package-controller/package.types';
import { INITIAL_PACKAGES } from '../../controllers/package-controller/package.controller';

export const packageApi = {
  async getPackages(): Promise<PricingPackageItem[]> {
    if (isMockMode()) {
      return [...INITIAL_PACKAGES];
    }
    const res = await apiRequest<PricingPackageItem[]>('/packages');
    return res.data;
  },

  async updatePackage(
    id: string,
    payload: UpdatePackagePayload
  ): Promise<PricingPackageItem> {
    if (isMockMode()) {
      const found = INITIAL_PACKAGES.find((p) => p.id === id);
      if (!found) throw new Error('Package not found');
      return { ...found, ...payload };
    }
    const res = await apiRequest<PricingPackageItem>(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};

export default packageApi;
