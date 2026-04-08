import HistoryDetailClient from './HistoryDetailClient';

// output: export (mobile build) 대응
export async function generateStaticParams() {
  return [];
}

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HistoryDetailClient id={id} />;
}
