import apiClient from './client';

export async function addFavorite(drinkId: string) {
  const response = await apiClient.post(`/favorite/${drinkId}`, {});
  return response.data;
}

export async function removeFavorite(drinkId: string) {
  const response = await apiClient.delete(`/favorite/${drinkId}`);
  return response.data;
}

export async function getFavorites() {
  const response = await apiClient.get('/favorite');
  return response.data;
}

export async function checkFavorite(drinkId: string) {
  const response = await apiClient.get(`/favorite/check/${drinkId}`);
  return response.data;
}

export async function getDrinkDetail(drinkId: string) {
  const response = await apiClient.get(`/drink/${drinkId}`);
  return response.data;
}
