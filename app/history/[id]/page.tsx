'use client';

import HistoryDetailClient from './HistoryDetailClient';
import { useParams } from 'next/navigation';

export default function HistoryDetailPage() {
  const params = useParams();
  return <HistoryDetailClient id={params.id as string} />;
}
