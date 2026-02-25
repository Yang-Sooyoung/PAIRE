'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

export function CustomDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'info',
  confirmText,
  cancelText,
}: CustomDialogProps) {
  const { language } = useI18n();
  const isKorean = language === 'ko';

  // 기본 텍스트 설정 (props로 전달되지 않은 경우)
  const defaultConfirmText = isKorean ? '확인' : 'OK';
  const defaultCancelText = isKorean ? '취소' : 'Cancel';

  const icons = {
    info: <Info className="w-6 h-6 text-gold" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    error: <AlertCircle className="w-6 h-6 text-destructive" />,
    confirm: <AlertCircle className="w-6 h-6 text-gold" />,
  };

  const iconBgColors = {
    info: 'bg-gold/10 border-gold/30',
    success: 'bg-green-500/10 border-green-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    error: 'bg-destructive/10 border-destructive/30',
    confirm: 'bg-gold/10 border-gold/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-full border-2 flex items-center justify-center",
                    iconBgColors[type]
                  )}>
                    {icons[type]}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-light text-foreground text-center mb-2">
                  {title}
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 flex gap-3">
                {type === 'confirm' ? (
                  <>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className={cn(
                        "flex-1 border-border text-foreground hover:bg-secondary",
                        isKorean && "font-[var(--font-noto-kr)]"
                      )}
                    >
                      {cancelText || defaultCancelText}
                    </Button>
                    <Button
                      onClick={() => {
                        onConfirm?.();
                        onClose();
                      }}
                      className={cn(
                        "flex-1 bg-gold hover:bg-gold-light text-background",
                        isKorean && "font-[var(--font-noto-kr)]"
                      )}
                    >
                      {confirmText || defaultConfirmText}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onClose}
                    className={cn(
                      "w-full bg-gold hover:bg-gold-light text-background",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}
                  >
                    {confirmText || defaultConfirmText}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
