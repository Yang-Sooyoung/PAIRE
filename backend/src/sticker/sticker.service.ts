import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

// 스티커 조건 정의
const STICKER_CONDITIONS = {
  'first-recommendation': async (prisma: PrismaService, userId: string) => {
    const count = await prisma.recommendation.count({ where: { userId } });
    return count >= 1;
  },
  'wine-lover': async (prisma: PrismaService, userId: string) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
    });
    const wineCount = recommendations.filter((r: any) => {
      const drinks = r.drinks as any[];
      return drinks.some(d => d.type?.toLowerCase().includes('wine'));
    }).length;
    return wineCount >= 5;
  },
  'night-owl': async (prisma: PrismaService, userId: string) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
    });
    return recommendations.some(r => {
      const hour = new Date(r.createdAt).getHours();
      return hour >= 22 || hour < 6;
    });
  },
  'early-bird': async (prisma: PrismaService, userId: string) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
    });
    return recommendations.some(r => {
      const hour = new Date(r.createdAt).getHours();
      return hour < 7;
    });
  },
  'premium-member': async (prisma: PrismaService, userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.membership === 'PREMIUM';
  },
  'collector': async (prisma: PrismaService, userId: string) => {
    const count = await prisma.favorite.count({ where: { userId } });
    return count >= 10;
  },
  'explorer': async (prisma: PrismaService, userId: string) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
    });
    const drinkTypes = new Set<string>();
    recommendations.forEach((r: any) => {
      const drinks = r.drinks as any[];
      drinks.forEach(d => drinkTypes.add(d.type));
    });
    return drinkTypes.size >= 5;
  },
  'social-butterfly': async (prisma: PrismaService, userId: string) => {
    const count = await prisma.recommendation.count({
      where: { userId, occasion: 'friends' },
    });
    return count >= 10;
  },
  'romantic': async (prisma: PrismaService, userId: string) => {
    const count = await prisma.recommendation.count({
      where: { userId, occasion: 'date' },
    });
    return count >= 5;
  },
  'solo-master': async (prisma: PrismaService, userId: string) => {
    const count = await prisma.recommendation.count({
      where: { userId, occasion: 'solo' },
    });
    return count >= 10;
  },
  'week-warrior': async (prisma: PrismaService, userId: string) => {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    
    // 연속 일수 계산
    let maxConsecutive = 0;
    let currentConsecutive = 1;
    
    for (let i = 1; i < recommendations.length; i++) {
      const prevDate = new Date(recommendations[i - 1].createdAt);
      const currDate = new Date(recommendations[i].createdAt);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentConsecutive++;
      } else {
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        currentConsecutive = 1;
      }
    }
    
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    return maxConsecutive >= 7;
  },
  'sharing-fairy': async (prisma: PrismaService, userId: string) => {
    // TODO: 공유 횟수 추적 기능 구현 필요
    // 임시로 false 반환
    return false;
  },
};

@Injectable()
export class StickerService {
  constructor(private prisma: PrismaService) {}

  /**
   * 사용자의 스티커 목록 조회
   */
  async getUserStickers(userId: string) {
    const stickers = await this.prisma.userSticker.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });

    return {
      stickers: stickers.map(s => ({
        id: s.stickerId,
        unlockedAt: s.unlockedAt,
      })),
    };
  }

  /**
   * 스티커 잠금 해제 조건 체크 및 자동 해제
   */
  async checkAndUnlockStickers(userId: string) {
    const unlockedStickers: string[] = [];

    for (const [stickerId, checkCondition] of Object.entries(STICKER_CONDITIONS)) {
      // 이미 해제된 스티커인지 확인
      const existing = await this.prisma.userSticker.findUnique({
        where: {
          userId_stickerId: {
            userId,
            stickerId,
          },
        },
      });

      if (existing) continue;

      // 조건 체크
      const isUnlocked = await checkCondition(this.prisma, userId);

      if (isUnlocked) {
        // 스티커 잠금 해제
        await this.prisma.userSticker.create({
          data: {
            userId,
            stickerId,
          },
        });
        unlockedStickers.push(stickerId);
      }
    }

    return { unlockedStickers };
  }

  /**
   * 특정 스티커 강제 잠금 해제 (관리자용)
   */
  async unlockSticker(userId: string, stickerId: string) {
    const existing = await this.prisma.userSticker.findUnique({
      where: {
        userId_stickerId: {
          userId,
          stickerId,
        },
      },
    });

    if (existing) {
      return { success: false, message: '이미 잠금 해제된 스티커입니다.' };
    }

    await this.prisma.userSticker.create({
      data: {
        userId,
        stickerId,
      },
    });

    return { success: true, message: '스티커가 잠금 해제되었습니다.' };
  }
}
