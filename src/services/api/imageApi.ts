import { apiRequest, isMockMode } from './apiClient';

export interface ImageUploadPayload {
  imageBase64: string;
  magiclink?: string;
}

export const imageApi = {
  /**
   * POST /api/image/upload
   * Mengunggah gambar base64 ke server storage Cloud Run.
   */
  async uploadImage(payload: ImageUploadPayload): Promise<string> {
    if (isMockMode()) {
      return payload.imageBase64.startsWith('data:')
        ? payload.imageBase64
        : `data:image/jpeg;base64,${payload.imageBase64}`;
    }

    const res = await apiRequest<string>('/api/image/upload', {
      method: 'POST',
      body: JSON.stringify({
        imageBase64: payload.imageBase64,
        magiclink: payload.magiclink || '',
      }),
    });

    return typeof res.data === 'string' ? res.data : '';
  },
};

export default imageApi;
