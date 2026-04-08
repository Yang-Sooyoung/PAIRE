import FavoriteDetailClient from './FavoriteDetailClient';

// output: export (mobile build) 대응
export async function generateStaticParams() {
  return [];
}

export default async function FavoriteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FavoriteDetailClient id={id} />;
}
