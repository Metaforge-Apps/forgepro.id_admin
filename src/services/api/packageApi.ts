import { apiRequest, isMockMode } from './apiClient';
import type {
  PricingPackageItem,
  CreatePackagePayload,
  UpdatePackagePayload,
  PackageTier,
} from '../../controllers/package-controller/package.types';
import { INITIAL_PACKAGES, formatRupiah } from '../../controllers/package-controller/package.controller';

export interface BackendPackageDto {
  id: string;
  name: string;
  productId: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  photoCount?: number;
  style?: number;
  features?: string[];
}

export const packageApi = {
  /**
   * GET /api/package/get/all
   * Mengambil seluruh daftar paket & harga dari server backend Cloud Run.
   */
  async getPackages(): Promise<PricingPackageItem[]> {
    if (isMockMode()) {
      return [...INITIAL_PACKAGES];
    }
    const res = await apiRequest<BackendPackageDto[]>('/api/package/get/all');
    if (!Array.isArray(res.data)) return [...INITIAL_PACKAGES];

    return res.data.map((item, index) => {
      const priceVal = item.price || 59000;
      return {
        id: item.id || `pkg-${index}`,
        tier: (item.name.toLowerCase() as PackageTier) || 'esensial',
        name: item.name,
        tag: index === 1 ? 'Paling Populer' : 'Standard',
        status: 'Tayang',
        priceValue: priceVal,
        price: formatRupiah(priceVal),
        sku: item.productId || `forgepro_${item.name.toLowerCase()}`,
        photoCount: item.photoCount || 24,
        creditAmount: 100,
        maxTemplates: item.style || 3,
        priceSub: 'referensi · sekali beli',
        description: item.shortDescription || 'Paket foto studio AI profesional siap unduh.',
        features: item.features || [
          `${item.photoCount || 24} hasil foto siap unduh`,
          'Resolusi Ultra-HD 300 DPI',
          'Masa akses cloud 14 hari',
        ],
        extraBenefits: '',
        accessDuration: '14 hari',
        displayOrder: index + 1,
        salesShare: index === 1 ? '54%' : index === 0 ? '28%' : '18%',
        isFeatured: index === 1,
      };
    });
  },

  /**
   * POST /api/package/create
   * Membuat paket baru di server backend.
   */
  async createPackage(payload: CreatePackagePayload): Promise<PricingPackageItem> {
    if (isMockMode()) {
      return {
        id: `pkg-${payload.tier}`,
        tier: payload.tier,
        name: payload.name,
        tag: 'Baru',
        status: payload.status || 'Draf',
        priceValue: payload.priceValue,
        price: formatRupiah(payload.priceValue),
        sku: payload.sku,
        photoCount: payload.photoCount,
        creditAmount: payload.creditAmount,
        maxTemplates: payload.maxTemplates,
        priceSub: 'referensi · sekali beli',
        description: payload.description,
        features: [`${payload.photoCount} foto siap unduh`],
        extraBenefits: payload.extraBenefits,
        accessDuration: payload.accessDuration,
        displayOrder: payload.displayOrder,
        salesShare: '0%',
        isFeatured: Boolean(payload.isFeatured),
      };
    }

    const body = {
      name: payload.name,
      productId: payload.sku,
      shortDescription: payload.description,
      price: payload.priceValue,
      originalPrice: payload.priceValue,
      photoCount: payload.photoCount,
      style: payload.maxTemplates,
      features: [`${payload.photoCount} foto AI resolusi tinggi`, 'Masa akses 14 hari'],
    };

    const res = await apiRequest<string>('/api/package/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const newId = typeof res.data === 'string' && res.data ? res.data : `pkg-${payload.tier}`;

    return {
      id: newId,
      tier: payload.tier,
      name: payload.name,
      tag: 'Baru',
      status: payload.status || 'Tayang',
      priceValue: payload.priceValue,
      price: formatRupiah(payload.priceValue),
      sku: payload.sku,
      photoCount: payload.photoCount,
      creditAmount: payload.creditAmount,
      maxTemplates: payload.maxTemplates,
      priceSub: 'referensi · sekali beli',
      description: payload.description,
      features: [`${payload.photoCount} foto siap unduh`],
      extraBenefits: payload.extraBenefits,
      accessDuration: payload.accessDuration,
      displayOrder: payload.displayOrder,
      salesShare: '0%',
      isFeatured: Boolean(payload.isFeatured),
    };
  },

  /**
   * PUT /api/package/update
   * Memperbarui data paket & harga di backend.
   */
  async updatePackage(
    id: string,
    payload: UpdatePackagePayload
  ): Promise<PricingPackageItem> {
    if (isMockMode()) {
      const found = INITIAL_PACKAGES.find((p) => p.id === id);
      if (!found) throw new Error('Package not found');
      return { ...found, ...payload };
    }

    const priceVal = payload.priceValue || 99000;
    const body = {
      id,
      name: payload.name || 'Paket',
      productId: payload.sku || 'forgepro_sku',
      shortDescription: payload.description || '',
      price: priceVal,
      originalPrice: priceVal,
      photoCount: payload.photoCount || 24,
      style: payload.maxTemplates || 3,
      features: payload.features || [`${payload.photoCount || 24} foto Ultra-HD`],
    };

    await apiRequest<string>('/api/package/update', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      id,
      tier: 'profesional',
      name: payload.name || 'Paket',
      tag: 'Diperbarui',
      status: payload.status || 'Tayang',
      priceValue: priceVal,
      price: formatRupiah(priceVal),
      sku: payload.sku || 'forgepro_sku',
      photoCount: payload.photoCount || 24,
      creditAmount: payload.creditAmount || 100,
      maxTemplates: payload.maxTemplates || 3,
      priceSub: 'referensi · sekali beli',
      description: payload.description || '',
      features: payload.features || [],
      extraBenefits: payload.extraBenefits || '',
      accessDuration: payload.accessDuration || '14 hari',
      displayOrder: payload.displayOrder || 1,
      salesShare: '50%',
      isFeatured: Boolean(payload.isFeatured),
    };
  },

  /**
   * DELETE /api/package/delete/{id}
   * Menghapus paket dari server backend.
   */
  async deletePackage(id: string): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    await apiRequest(`/api/package/delete/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

export default packageApi;
