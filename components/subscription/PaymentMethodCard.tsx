// components/subscription/PaymentMethodCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Trash2 } from 'lucide-react';
import { CustomDialog } from '@/components/ui/custom-dialog';
import apiClient from '@/app/api/client';
import { useI18n } from '@/lib/i18n/context';

interface PaymentMethodCardProps {
    billingKey: string;
    token: string;
    onRemoved: () => void;
}

export function PaymentMethodCard({ billingKey, token }: PaymentMethodCardProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const { language } = useI18n();
    const isKorean = language === 'ko';

    const handleRemove = async () => {
        try {
            setLoading(true);
            await apiClient.post('/subscription/remove-method', {});
            setShowSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('결제 수단 제거 실패:', error);
            setErrorMessage(error.response?.data?.message || (isKorean ? '결제 수단 제거에 실패했습니다.' : 'Failed to remove payment method.'));
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-secondary border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <p className="text-foreground font-medium">
                                {isKorean ? '등록된 결제 수단' : 'Registered Payment Method'}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {isKorean ? '카드' : 'Card'} •••• {billingKey.slice(-4)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirm(true)}
                        disabled={loading}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isKorean ? '제거' : 'Remove'}
                    </Button>
                </div>
            </div>

            {/* Confirm Dialog */}
            <CustomDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleRemove}
                type="confirm"
                title={isKorean ? '결제 수단을 제거하시겠어요?' : 'Remove payment method?'}
                description={isKorean ? '결제 수단을 제거하면 구독이 취소됩니다. 계속하시겠습니까?' : 'Removing your payment method will cancel your subscription. Continue?'}
                confirmText={isKorean ? '제거' : 'Remove'}
                cancelText={isKorean ? '취소' : 'Cancel'}
            />

            {/* Success Dialog */}
            <CustomDialog
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                type="success"
                title={isKorean ? '제거 완료' : 'Removed'}
                description={isKorean ? '결제 수단이 성공적으로 제거되었습니다.' : 'Payment method removed successfully.'}
                confirmText={isKorean ? '확인' : 'OK'}
            />

            {/* Error Dialog */}
            <CustomDialog
                isOpen={showError}
                onClose={() => setShowError(false)}
                type="error"
                title={isKorean ? '제거 실패' : 'Failed to Remove'}
                description={errorMessage}
                confirmText={isKorean ? '확인' : 'OK'}
            />
        </>
    );
}
