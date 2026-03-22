import FavoriteDetailClient from './FavoriteDetailClient';

export async function generateStaticParams() {
  return [];
}

export default function FavoriteDetailPage() {
  return <FavoriteDetailClient />;
}
