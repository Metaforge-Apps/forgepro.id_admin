import { apiRequest, isMockMode } from './apiClient';
import type {
  SuitStyleItem,
  CreateSuitStylePayload,
  UpdateSuitStylePayload,
} from '../../controllers/style-controller/style.types';
import { INITIAL_SUIT_STYLES } from '../../controllers/style-controller/style.seed';

export const styleApi = {
  async getStyles(): Promise<SuitStyleItem[]> {
    if (isMockMode()) {
      return [...INITIAL_SUIT_STYLES];
    }
    const res = await apiRequest<SuitStyleItem[]>('/styles');
    return res.data;
  },

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
    const res = await apiRequest<SuitStyleItem>('/styles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateStyle(
    id: string,
    payload: UpdateSuitStylePayload
  ): Promise<SuitStyleItem> {
    if (isMockMode()) {
      const found = INITIAL_SUIT_STYLES.find((s) => s.id === id);
      if (!found) throw new Error('Style not found');
      return { ...found, ...payload };
    }
    const res = await apiRequest<SuitStyleItem>(`/styles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async deleteStyle(id: string): Promise<boolean> {
    if (isMockMode()) {
      return true;
    }
    await apiRequest(`/styles/${id}`, { method: 'DELETE' });
    return true;
  },
};

export default styleApi;
