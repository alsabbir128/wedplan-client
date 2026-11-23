import type { Metadata } from 'next'
import { BrowseDirectory } from '@/components/marketplace/browse-directory'
import { SERVICE_CATEGORIES } from '@/lib/marketplace-data'

export const metadata: Metadata = {
  title: 'Browse wedding vendors | WedPlan',
  description: 'Search trusted wedding vendors by service, location, and starting price.',
}

type BrowsePageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const categoryAliases: Record<string, string> = {
  Venues: 'Wedding Venues',
  Photography: 'Photography & Videography',
  'Florals & decor': 'Decoration & Florist',
  Florals: 'Decoration & Florist',
  Catering: 'Catering Services',
  'Wedding fashion': 'Wedding Fashion',
  'Makeup & styling': 'Makeup & Styling',
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const requestedCategory = first(params.category)
  const mappedCategory = categoryAliases[requestedCategory] ?? requestedCategory
  const category = SERVICE_CATEGORIES.some((item) => item.value === mappedCategory) ? mappedCategory : ''

  return <BrowseDirectory initialFilters={{
    search: first(params.search) || first(params.q),
    location: first(params.location),
    category,
    sort: first(params.sort),
  }} />
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}
