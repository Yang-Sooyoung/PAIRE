// lib/share.ts

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

/**
 * 웹 공유 API를 사용하여 공유
 */
export async function shareViaWebAPI(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // 사용자가 취소한 경우
      return false;
    }
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * 클립보드에 텍스트 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}

/**
 * 카카오톡 공유
 */
export function shareToKakao(data: {
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
}): boolean {
  if (typeof window === 'undefined' || !(window as any).Kakao) {
    console.error('Kakao SDK not loaded');
    return false;
  }

  try {
    const Kakao = (window as any).Kakao;
    
    if (!Kakao.isInitialized()) {
      console.error('Kakao SDK not initialized');
      return false;
    }

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl || 'https://paire.app/images/pairy_main.png',
        link: {
          mobileWebUrl: data.link,
          webUrl: data.link,
        },
      },
      buttons: [
        {
          title: '자세히 보기',
          link: {
            mobileWebUrl: data.link,
            webUrl: data.link,
          },
        },
      ],
    });

    return true;
  } catch (error) {
    console.error('Kakao share failed:', error);
    return false;
  }
}

/**
 * 추천 결과 공유 텍스트 생성
 */
export function generateShareText(drinks: Array<{ name: string; type: string }>, isKorean: boolean): string {
  const drinkNames = drinks.map(d => d.name).join(', ');
  
  if (isKorean) {
    return `PAIRÉ가 추천하는 음료: ${drinkNames}\n\n나만의 음료 추천을 받아보세요! 🍷✨`;
  } else {
    return `PAIRÉ recommends: ${drinkNames}\n\nGet your personalized drink recommendations! 🍷✨`;
  }
}
