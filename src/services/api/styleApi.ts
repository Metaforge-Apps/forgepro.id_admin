import { apiRequest, isMockMode } from './apiClient';
import type {
  SuitStyleItem,
  CreateSuitStylePayload,
  UpdateSuitStylePayload,
  SuitCategory,
} from '../../controllers/style-controller/style.types';
import { INITIAL_SUIT_STYLES } from '../../controllers/style-controller/style.seed';

export interface BackendStyleDto {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  prompt?: string;
}

export const styleApi = {
  /**
   * GET /api/style/get/all
   * Mengambil semua katalog template gaya jas dari server backend Cloud Run.
   */
  async getStyles(): Promise<SuitStyleItem[]> {
    if (isMockMode()) {
      return [...INITIAL_SUIT_STYLES];
    }
    const res = await apiRequest<BackendStyleDto[]>('/api/style/get/all');
    if (!Array.isArray(res.data)) return [...INITIAL_SUIT_STYLES];

    return res.data.map((item) => ({
      id: item.id,
      name: item.name,
      category: (item.category as SuitCategory) || 'Bisnis',
      status: 'Tayang',
      stats: '1.200 pemotretan',
      count: 0,
      image: item.thumbnailUrl || '/images/jas-navy-eksekutif.jpg',
      description: 'Potret jas profesional AI dengan pencahayaan studio seimbang.',
      prompt: item.prompt || '',
      aspectRatio: item.category === 'Wanita' ? '9:16' : '3:4',
      isPopular: true,
      isNew: false,
      tags: [item.category],
      updatedAt: 'Baru saja',
    }));
  },

  /**
   * POST /api/style/create
   * Menambahkan template jas baru ke backend.
   */
  async createStyle(payload: CreateSuitStylePayload): Promise<SuitStyleItem> {
    if (isMockMode()) {
      return {
        id: `gaya-${Date.now()}`,
        name: payload.name,
        category: payload.category || 'Bisnis',
        status: payload.status || 'Draf',
        stats: '0 pemotretan',
        count: 0,
        image: payload.image || '',
        description: payload.description || '',
        prompt: payload.prompt || '',
        aspectRatio: payload.aspectRatio || '3:4',
        isPopular: Boolean(payload.isPopular),
        isNew: Boolean(payload.isNew),
        tags: payload.tags || [],
        updatedAt: 'Baru saja',
      };
    }

    const body = {
      name: payload.name.trim(),
      category: payload.category || 'Bisnis',
      thumbnailUrl: payload.image || '',
      prompt: payload.prompt?.trim() || '',
    };

    const res = await apiRequest<string>('/api/style/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const newId = typeof res.data === 'string' && res.data ? res.data : `style-${Date.now()}`;

    return {
      id: newId,
      name: payload.name,
      category: payload.category || 'Bisnis',
      status: payload.status || 'Tayang',
      stats: '0 pemotretan',
      count: 0,
      image: payload.image || '',
      description: payload.description || '',
      prompt: payload.prompt || '',
      aspectRatio: payload.aspectRatio || '3:4',
      isPopular: Boolean(payload.isPopular),
      isNew: Boolean(payload.isNew),
      tags: payload.tags || [],
      updatedAt: 'Baru saja',
    };
  },

  /**
   * PUT /api/style/update
   * Memperbarui template jas by ID di backend.
   */
  async updateStyle(
    id: string,
    payload: UpdateSuitStylePayload
  ): Promise<SuitStyleItem> {
    if (isMockMode()) {
      const found = INITIAL_SUIT_STYLES.find((s) => s.id === id);
      if (!found) throw new Error('Style not found');
      return { ...found, ...payload };
    }

    const body = {
      id,
      name: payload.name || '',
      category: payload.category || 'Bisnis',
      thumbnailUrl: payload.image || '',
      prompt: payload.prompt || '',
    };

    await apiRequest<string>('/api/style/update', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      id,
      name: payload.name || '',
      category: (payload.category as SuitCategory) || 'Bisnis',
      status: payload.status || 'Tayang',
      stats: '1.200 pemotretan',
      count: 0,
      image: payload.image || '',
      description: payload.description || '',
      prompt: payload.prompt || '',
      aspectRatio: payload.aspectRatio || '3:4',
      isPopular: Boolean(payload.isPopular),
      isNew: Boolean(payload.isNew),
      tags: payload.tags || [],
      updatedAt: 'Baru saja',
    };
  },

  /**
   * DELETE /api/style/delete/{id}
   * Menghapus template jas dari database backend.
   */
  async deleteStyle(id: string): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    await apiRequest(`/api/style/delete/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

export default styleApi;
