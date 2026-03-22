import FavoriteDetailClient from './FavoriteDetailClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default async function FavoriteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FavoriteDetailClient id={id} />;
}
