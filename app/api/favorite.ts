import apiClient from './client';

export async function addFavorite(drinkId: string, token?: string) {
  const response = await apiClient.post(`/favorite/${drinkId}`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function removeFavorite(drinkId: string, token?: string) {
  const response = await apiClient.delete(`/favorite/${drinkId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function getFavorites(token?: string) {
  const response = await apiClient.get('/favorite', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

export async function checkFavorite(drinkId: string, token?: string) {
  const response = await apiClient.get(`/favorite/check/${drinkId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}
