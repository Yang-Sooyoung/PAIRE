// components/subscription/PaymentMethodCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Trash2 } from 'lucide-react';
import axios from 'axios';

interface PaymentMethodCardProps {
    billingKey: string;
    token: string;
    onRemoved: () => void;
}

export function PaymentMethodCard({ billingKey, token, onRemoved }: PaymentMethodCardProps) {
    const [loading, setLoading] = useState(false);

    const handleRemove = async () => {
        if (!confirm('결제 수단을 제거하시겠습니까? 구독이 취소됩니다.')) {
            return;
        }

        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

            await axios.post(
                `${apiUrl}/subscription/remove-method`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert('결제 수단이 제거되었습니다.');
            onRemoved();
        } catch (error: any) {
            console.error('결제 수단 제거 실패:', error);
            alert(error.response?.data?.message || '결제 수단 제거에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                        <p className="text-white font-medium">등록된 결제 수단</p>
                        <p className="text-slate-400 text-sm">카드 •••• {billingKey.slice(-4)}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    제거
                </Button>
            </div>
        </div>
    );
}
