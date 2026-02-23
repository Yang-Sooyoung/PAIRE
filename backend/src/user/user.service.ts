import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async deleteUser(userId: string) {
    // Delete all user data
    await this.prisma.$transaction([
      // Delete recommendations
      this.prisma.recommendation.deleteMany({
        where: { userId },
      }),
      // Delete subscriptions
      this.prisma.subscription.deleteMany({
        where: { userId },
      }),
      // Delete payments
      this.prisma.payment.deleteMany({
        where: { userId },
      }),
      // Delete user
      this.prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return { success: true, message: '계정이 삭제되었습니다.' };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
