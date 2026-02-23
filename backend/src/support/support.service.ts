import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(dto: { userId?: string; email?: string; message: string }) {
    const message = await this.prisma.supportMessage.create({
      data: {
        userId: dto.userId,
        email: dto.email,
        message: dto.message,
      },
    });

    return { success: true, message: '메시지가 전달되었습니다!' };
  }
}
