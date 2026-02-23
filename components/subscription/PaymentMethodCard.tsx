// components/subscription/PaymentMethodCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useUserStore } from '@/app/store/userStore';
import { useRouter } from 'next/navigation';

interface PaymentMethodCardProps {
    billingKey: string;
    token: string;
    onRemoved: () => void;
}

export function PaymentMethodCard({ billingKey, token, onRemoved }: PaymentMethodCardProps) {
    const [loading, setLoading] = useState(false);
    const { refreshTokenIfNeeded } = useUserStore();
    const router = useRouter();

    const handleRemove = async () => {
        if (!confirm('결제 수단을 제거하시겠습니까? 구독이 취소됩니다.')) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            let currentToken = token;
            let response;

            try {
                response = await axios.post(
                    `${apiUrl}/subscription/remove-method`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${currentToken}` },
                    }
                );
            } catch (error: any) {
                // 401 에러면 토큰 갱신 후 재시도
                if (error?.response?.status === 401) {
                    console.log('Token expired, refreshing...');
                    const newToken = await refreshTokenIfNeeded();

                    if (newToken) {
                        currentToken = newToken;
                        response = await axios.post(
                            `${apiUrl}/subscription/remove-method`,
                            {},
                            {
                                headers: { Authorization: `Bearer ${currentToken}` },
                            }
                        );
                    } else {
                        console.log('Token refresh failed, redirecting to login');
                        router.push('/login');
                        return;
                    }
                } else {
                    throw error;
                }
            }

            alert('결제 수단이 제거되었습니다.');
            
            // 페이지 새로고침으로 상태 업데이트
            window.location.reload();
        } catch (error: any) {
            console.error('결제 수단 제거 실패:', error);
            alert(error.response?.data?.message || '결제 수단 제거에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-secondary border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                        <p className="text-foreground font-medium">등록된 결제 수단</p>
                        <p className="text-muted-foreground text-sm">카드 •••• {billingKey.slice(-4)}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={loading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    제거
                </Button>
            </div>
        </div>
    );
}
