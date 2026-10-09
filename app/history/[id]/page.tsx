import HistoryDetailClient from './HistoryDetailClient';

// Capacitor static export: 런타임에 동적 경로를 처리하므로 빈 배열 반환
// Next.js 16 버그 우회: 빈 배열 대신 placeholder 사용
export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  return <HistoryDetailClient id={params.id} />;
}
