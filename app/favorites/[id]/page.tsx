'use client';

import FavoriteDetailClient from './FavoriteDetailClient';
import { useParams } from 'next/navigation';

export default function FavoriteDetailPage() {
  const params = useParams();
  return <FavoriteDetailClient id={params.id as string} />;
}
