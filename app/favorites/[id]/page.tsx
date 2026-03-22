import FavoriteDetailClient from './FavoriteDetailClient';

export default async function FavoriteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FavoriteDetailClient id={id} />;
}
