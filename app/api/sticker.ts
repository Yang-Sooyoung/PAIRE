import apiClient from './client';

export async function getUserStickers(token?: string) {
  const response = await apiClient.get('/sticker', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function checkAndUnlockStickers(token?: string) {
  const response = await apiClient.post('/sticker/check', {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}
