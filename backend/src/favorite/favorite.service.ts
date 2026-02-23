import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, drinkId: string) {
    // PREMIUM 사용자만 가능
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.membership !== 'PREMIUM') {
      throw new BadRequestException('즐겨찾기는 PREMIUM 멤버만 이용할 수 있습니다.');
    }

    // 음료 정보 조회
    const drink = await this.prisma.drink.findUnique({ where: { id: drinkId } });
    if (!drink) {
      throw new BadRequestException('음료를 찾을 수 없습니다.');
    }

    // 이미 즐겨찾기에 있는지 확인
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_drinkId: { userId, drinkId },
      },
    });

    if (existing) {
      throw new BadRequestException('이미 즐겨찾기에 추가된 음료입니다.');
    }

    // 즐겨찾기 추가
    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        drinkId,
        drinkName: drink.name,
        drinkType: drink.type,
        drinkImage: drink.image,
      },
    });

    return { favorite };
  }

  async removeFavorite(userId: string, drinkId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_drinkId: { userId, drinkId },
      },
    });

    if (!favorite) {
      throw new BadRequestException('즐겨찾기에 없는 음료입니다.');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_drinkId: { userId, drinkId },
      },
    });

    return { success: true };
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { favorites };
  }

  async isFavorite(userId: string, drinkId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_drinkId: { userId, drinkId },
      },
    });

    return { isFavorite: !!favorite };
  }
}
