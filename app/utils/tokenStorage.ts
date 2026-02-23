const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export async function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export async function getTokens() {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem(ACCESS_KEY),
      refreshToken: localStorage.getItem(REFRESH_KEY),
    };
  }
  return { accessToken: null, refreshToken: null };
}

export async function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
