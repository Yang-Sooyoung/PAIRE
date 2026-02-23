const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getUserStickers(token: string) {
  const response = await fetch(`${API_URL}/sticker`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401: Unauthorized');
    }
    throw new Error('스티커 목록을 불러오는데 실패했습니다.');
  }

  return response.json();
}

export async function checkAndUnlockStickers(token: string) {
  const response = await fetch(`${API_URL}/sticker/check`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('401: Unauthorized');
    }
    throw new Error('스티커 체크에 실패했습니다.');
  }

  return response.json();
}
