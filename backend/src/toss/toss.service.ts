import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  totalAmount: number;
  status: string;
  approvedAt: string;
  method?: string;
}

interface TossCancelResponse {
  paymentKey: string;
  canceledAt: string;
}

@Injectable()
export class TossService {
  private secretKey: string;
  private clientKey: string;
  private baseUrl = 'https://api.tosspayments.com/v1';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('TOSS_SECRET_KEY');
    this.clientKey = this.configService.get('TOSS_CLIENT_KEY');
  }

  /**
   * 결제 승인 (Billing Auth)
   */
  async authorizePayment(paymentKey: string, orderId: string, amount: number) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(`결제 승인 실패: ${error.message || 'Unknown error'}`);
      }

      const data = (await response.json()) as TossPaymentResponse;
      return {
        success: true,
        paymentKey: data.paymentKey,
        orderId: data.orderId,
        amount: data.totalAmount,
        status: data.status,
        approvedAt: data.approvedAt,
      };
    } catch (error) {
      console.error('Toss 결제 승인 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 취소
   */
  async cancelPayment(paymentKey: string, cancelReason: string) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(`결제 취소 실패: ${error.message || 'Unknown error'}`);
      }

      const data = (await response.json()) as TossCancelResponse;
      return {
        success: true,
        paymentKey: data.paymentKey,
        canceledAt: data.canceledAt,
      };
    } catch (error) {
      console.error('Toss 결제 취소 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 조회
   */
  async getPayment(paymentKey: string) {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentKey}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`,
        },
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(`결제 조회 실패: ${error.message || 'Unknown error'}`);
      }

      const data = (await response.json()) as TossPaymentResponse;
      return {
        success: true,
        paymentKey: data.paymentKey,
        orderId: data.orderId,
        amount: data.totalAmount,
        status: data.status,
        method: data.method,
        approvedAt: data.approvedAt,
      };
    } catch (error) {
      console.error('Toss 결제 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 웹훅 서명 검증
   */
  verifyWebhookSignature(signature: string, body: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(body)
        .digest('base64');

      return signature === expectedSignature;
    } catch (error) {
      console.error('웹훅 서명 검증 오류:', error);
      return false;
    }
  }

  /**
   * 클라이언트 키 반환 (프론트엔드용)
   */
  getClientKey(): string {
    return this.clientKey;
  }
}
