'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getRecommendationDetail } from '@/app/api/recommendation';
import { addFavorite, removeFavorite, checkFavorite } from '@/app/api/favorite';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Heart, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { translateDrinkType, translateOccasion, formatDrinkPriceByRegion } from '@/lib/drink-translations';

interface Drink {
    id: string;
    name: string;
    nameEn?: string;
    type: string;
    description: string;
    descriptionEn?: string;
    tastingNotes: string[];
    image: string;
    price: string;
}

interface RecommendationDetail {
    id: string;
    occasion: string;
    tastes: string[];
    drinks: Drink[];
    detectedFoods: string[];
    fairyMessage: string;
    imageUrl?: string;
    createdAt: string;
}

export default function HistoryDetailPage({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useUserStore();
    const { language } = useI18n();
    const isKorean = language === 'ko';

    const [detail, setDetail] = useState<RecommendationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});
    const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
    const [isKoreaRegion, setIsKoreaRegion] = useState<boolean | null>(null);

    useEffect(() => {
        import('@/lib/region-detector').then(({ detectCountryByIP }) => {
            detectCountryByIP().then(country => setIsKoreaRegion(country === 'KR'));
        });
    }, []);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchDetail = async () => {
            try {
                const response = await getRecommendationDetail(id);
                const rec = response.recommendation;

                // JSON 필드가 string으로 올 경우 파싱
                if (rec && typeof rec.drinks === 'string') {
                    try { rec.drinks = JSON.parse(rec.drinks); } catch { rec.drinks = []; }
                }
                if (rec && typeof rec.detectedFoods === 'string') {
                    try { rec.detectedFoods = JSON.parse(rec.detectedFoods); } catch { rec.detectedFoods = []; }
                }
                if (rec && typeof rec.tastes === 'string') {
                    try { rec.tastes = JSON.parse(rec.tastes); } catch { rec.tastes = []; }
                }

                setDetail(rec);

                // drinks가 배열인지 확인
                const drinks = rec?.drinks;
                if (drinks && Array.isArray(drinks)) {
                    // 각 음료의 즐겨찾기 상태 확인
                    const statusMap: Record<string, boolean> = {};
                    for (const drink of drinks) {
                        try {
                            const favResponse = await checkFavorite(drink.id);
                            statusMap[drink.id] = favResponse.isFavorite;
                        } catch (error) {
                            statusMap[drink.id] = false;
                        }
                    }
                    setFavoriteStatus(statusMap);
                }
            } catch (error) {
                console.error('Failed to fetch detail:', error);
                toast.error(isKorean ? '상세 정보를 불러올 수 없습니다.' : 'Failed to load details.');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, user, router, isKorean]);

    const handleToggleFavorite = async (drinkId: string) => {
        setTogglingFavorite(drinkId);
        try {
            const isFavorite = favoriteStatus[drinkId];
            if (isFavorite) {
                await removeFavorite(drinkId);
                toast.success(isKorean ? '즐겨찾기에서 제거했습니다.' : 'Removed from favorites.');
            } else {
                await addFavorite(drinkId);
                toast.success(isKorean ? '즐겨찾기에 추가했습니다.' : 'Added to favorites.');
            }
            setFavoriteStatus(prev => ({ ...prev, [drinkId]: !isFavorite }));
        } catch (error: any) {
            toast.error(error.message || (isKorean ? '오류가 발생했습니다.' : 'An error occurred.'));
        } finally {
            setTogglingFavorite(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold animate-spin" />
            </div>
        );
    }

    if (!detail) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
            </div>

            <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="text-gold hover:text-gold-light transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className={cn(
                        "text-lg font-medium text-foreground tracking-wide",
                        isKorean && "font-[var(--font-noto-kr)] tracking-normal"
                    )}>
                        {isKorean ? '추천 상세' : 'Recommendation Detail'}
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8 relative z-10 space-y-6">
                {/* 기본 정보 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                            {new Date(detail.createdAt).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>

                    {detail.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                            <img
                                src={detail.imageUrl}
                                alt="Food"
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}

                    <h2 className={cn(
                        "text-xl font-semibold text-foreground mb-3",
                        isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                        {translateOccasion(detail.occasion, language)}
                    </h2>

                    {detail.detectedFoods && detail.detectedFoods.length > 0 && (
                        <div className="mb-3">
                            <p className={cn(
                                "text-sm text-muted-foreground mb-2",
                                isKorean && "font-[var(--font-noto-kr)]"
                            )}>
                                {isKorean ? '감지된 음식' : 'Detected Foods'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {detail.detectedFoods.map((food, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground"
                                    >
                                        {food}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {detail.tastes && detail.tastes.length > 0 && (
                        <div>
                            <p className={cn(
                                "text-sm text-muted-foreground mb-2",
                                isKorean && "font-[var(--font-noto-kr)]"
                            )}>
                                {isKorean ? '선호 맛' : 'Preferred Tastes'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {detail.tastes.map((taste, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold"
                                    >
                                        {taste}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* 요정 메시지 */}
                {detail.fairyMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-6"
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                            <p className={cn(
                                "text-foreground leading-relaxed",
                                isKorean && "font-[var(--font-noto-kr)]"
                            )}>
                                {detail.fairyMessage}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* 추천 음료 목록 */}
                <div className="space-y-4">
                    <h3 className={cn(
                        "text-lg font-semibold text-foreground",
                        isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                        {isKorean ? '추천 음료' : 'Recommended Drinks'}
                    </h3>

                    {detail.drinks && detail.drinks.length > 0 ? (
                        detail.drinks.map((drink, index) => (
                            <motion.div
                                key={drink.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/30 transition"
                            >
                                <div className="flex gap-4 p-4">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                                        {drink.image ? (
                                            <img
                                                src={drink.image}
                                                alt={drink.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gold/30">
                                                🍷
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    "text-lg font-semibold text-foreground mb-1",
                                                    isKorean && "font-[var(--font-noto-kr)]"
                                                )}>
                                                    {isKorean ? drink.name : (drink.nameEn || drink.name)}
                                                </h4>
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    {translateDrinkType(drink.type, language)}
                                                </p>
                                                {drink.price && (
                                                    <p className="text-sm font-medium text-gold">
                                                        {formatDrinkPriceByRegion(drink.price, isKoreaRegion ?? isKorean)}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleToggleFavorite(drink.id)}
                                                disabled={togglingFavorite === drink.id}
                                                className="flex-shrink-0 p-2 rounded-full hover:bg-secondary transition"
                                            >
                                                {togglingFavorite === drink.id ? (
                                                    <Loader2 className="w-5 h-5 text-gold animate-spin" />
                                                ) : (
                                                    <Heart
                                                        className={cn(
                                                            "w-5 h-5 transition",
                                                            favoriteStatus[drink.id]
                                                                ? "fill-gold text-gold"
                                                                : "text-muted-foreground"
                                                        )}
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        <p className={cn(
                                            "text-sm text-muted-foreground mb-2 line-clamp-2",
                                            isKorean && "font-[var(--font-noto-kr)]"
                                        )}>
                                            {isKorean ? drink.description : (drink.descriptionEn || drink.description)}
                                        </p>

                                        {drink.tastingNotes && drink.tastingNotes.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {drink.tastingNotes.map((note, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold"
                                                    >
                                                        {note}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className={cn(isKorean && "font-[var(--font-noto-kr)]")}>
                                {isKorean ? '추천 음료가 없습니다.' : 'No drinks recommended.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
