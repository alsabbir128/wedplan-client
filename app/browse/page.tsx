import { BrowseServices } from '@/components/browse-services'

type BrowsePageProps = { searchParams: Promise<{ category?: string; location?: string; search?: string }> }

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const query = await searchParams
  return <BrowseServices initialCategory={query.category ?? ''} initialLocation={query.location ?? ''} initialSearch={query.search ?? ''} />
}
