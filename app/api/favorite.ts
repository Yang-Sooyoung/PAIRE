const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function addFavorite(drinkId: string, token: string) {
  const response = await fetch(`${API_URL}/favorite/${drinkId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '즐겨찾기 추가에 실패했습니다.');
  }

  return response.json();
}

export async function removeFavorite(drinkId: string, token: string) {
  const response = await fetch(`${API_URL}/favorite/${drinkId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '즐겨찾기 제거에 실패했습니다.');
  }

  return response.json();
}

export async function getFavorites(token: string) {
  const response = await fetch(`${API_URL}/favorite`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401: Unauthorized');
    }
    const error = await response.json();
    throw new Error(error.message || '즐겨찾기 목록을 불러오는데 실패했습니다.');
  }

  return response.json();
}

export async function checkFavorite(drinkId: string, token: string) {
  const response = await fetch(`${API_URL}/favorite/check/${drinkId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '즐겨찾기 확인에 실패했습니다.');
  }

  return response.json();
}
