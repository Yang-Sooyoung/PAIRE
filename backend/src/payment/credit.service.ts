import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TossService } from '@/toss/toss.service';
import { CREDIT_PACKAGES, CreditPackageType } from './credit-packages';

@Injectable()
export class CreditService {
  constructor(
    private prisma: PrismaService,
    private tossService: TossService,
  ) {}

  /**
   * 크레딧 패키지 목록 조회
   */
  getPackages() {
    return {
      packages: Object.values(CREDIT_PACKAGES),
    };
  }

  /**
   * 사용자 크레딧 잔액 조회
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, membership: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      credits: user.credits,
      membership: user.membership,
    };
  }

  /**
   * 크레딧 구매 생성
   */
  async createPurchase(userId: string, dto: { packageType: CreditPackageType }) {
    const pkg = CREDIT_PACKAGES[dto.packageType];

    if (!pkg) {
      throw new BadRequestException('유효하지 않은 패키지입니다.');
    }

    // 주문 ID 생성
    const orderId = `credit_${userId}_${Date.now()}`;

    // 구매 내역 생성
    const purchase = await this.prisma.creditPurchase.create({
      data: {
        userId,
        packageType: dto.packageType,
        credits: pkg.credits,
        price: pkg.price,
        orderId,
        status: 'PENDING',
      },
    });

    return {
      orderId: purchase.orderId,
      amount: purchase.price,
      orderName: pkg.nameKo,
    };
  }

  /**
   * 크레딧 구매 확인 (결제 완료 후)
   */
  async confirmPurchase(userId: string, dto: { orderId: string; paymentKey: string; amount: number }) {
    // 구매 내역 조회
    const purchase = await this.prisma.creditPurchase.findUnique({
      where: { orderId: dto.orderId },
    });

    if (!purchase) {
      throw new NotFoundException('구매 내역을 찾을 수 없습니다.');
    }

    if (purchase.userId !== userId) {
      throw new BadRequestException('권한이 없습니다.');
    }

    if (purchase.status === 'COMPLETED') {
      throw new BadRequestException('이미 처리된 구매입니다.');
    }

    // 금액 검증
    if (purchase.price !== dto.amount) {
      throw new BadRequestException('결제 금액이 일치하지 않습니다.');
    }

    try {
      // Toss 결제 승인
      const paymentResult = await this.tossService.confirmPayment(
        dto.paymentKey,
        dto.orderId,
        dto.amount
      );

      if (!paymentResult.success) {
        throw new BadRequestException('결제 승인에 실패했습니다.');
      }

      // 구매 내역 업데이트
      await this.prisma.creditPurchase.update({
        where: { orderId: dto.orderId },
        data: {
          paymentKey: dto.paymentKey,
          status: 'COMPLETED',
        },
      });

      // 사용자 크레딧 증가
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: purchase.credits },
        },
      });

      return {
        success: true,
        credits: purchase.credits,
        message: `${purchase.credits}개의 크레딧이 충전되었습니다.`,
      };
    } catch (error) {
      // 결제 실패 처리
      await this.prisma.creditPurchase.update({
        where: { orderId: dto.orderId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }

  /**
   * 크레딧 구매 내역 조회
   */
  async getPurchaseHistory(userId: string) {
    const purchases = await this.prisma.creditPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { purchases };
  }
}
