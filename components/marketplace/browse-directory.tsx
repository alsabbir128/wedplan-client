'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import useSWR from 'swr'
import { MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { SiteHeader } from '@/components/wedplan-home'
import { ServiceCard } from '@/components/marketplace/service-card'
import { apiRequest } from '@/lib/api'
import { ApiList, MarketplaceService, SERVICE_CATEGORIES } from '@/lib/marketplace-data'

type InitialFilters = { search?: string; location?: string; category?: string; sort?: string }

export function BrowseDirectory({ initialFilters }: { initialFilters: InitialFilters }) {
  const [search, setSearch] = useState(initialFilters.search ?? '')
  const [location, setLocation] = useState(initialFilters.location ?? '')
  const [category, setCategory] = useState(initialFilters.category ?? '')
  const [sort, setSort] = useState(initialFilters.sort ?? 'recommended')
  const deferredSearch = useDeferredValue(search)
  const deferredLocation = useDeferredValue(location)
  const key = useMemo(() => {
    const params = new URLSearchParams()
    if (deferredSearch.trim()) params.set('search', deferredSearch.trim())
    if (deferredLocation.trim()) params.set('location', deferredLocation.trim())
    if (category) params.set('category', category)
    if (sort !== 'recommended') params.set('sort', sort)
    return `/services?${params.toString()}`
  }, [category, deferredLocation, deferredSearch, sort])
  const { data, error, isLoading } = useSWR(key, (path) => apiRequest<ApiList<MarketplaceService> & { pagination?: { total: number } }>(path))
  const services = data?.items ?? []

  return (
    <>
      <SiteHeader />
      <main className="browse-page">
        <div className="browse-topline"><a className="back-link" href="/">Home</a><span>THE WEDPLAN DIRECTORY</span></div>
        <section className="browse-intro">
          <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
          <h1>Find your <em>people.</em></h1>
          <p>Thoughtful vendors for all the little things that make your day yours.</p>
        </section>
        <form className="browse-search" onSubmit={(event) => event.preventDefault()} role="search">
          <label><Search size={18} aria-hidden="true" /><span className="sr-only">Search vendors</span><input type="search" placeholder="Try a venue, photographer, or florist" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <span aria-hidden="true" />
          <label><MapPin size={18} aria-hidden="true" /><span className="sr-only">Filter by location</span><input placeholder="City or destination" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
        </form>
        <div className="browse-controls">
          <div className="category-filters" aria-label="Filter by category">
            <button type="button" onClick={() => setCategory('')} aria-pressed={!category} className={!category ? 'filter-chip active' : 'filter-chip'}>All services</button>
            {SERVICE_CATEGORIES.map((item) => (
              <button type="button" key={item.value} onClick={() => setCategory(item.value)} aria-pressed={category === item.value} className={category === item.value ? 'filter-chip active' : 'filter-chip'}>{item.label}</button>
            ))}
          </div>
          <label className="sort-control"><SlidersHorizontal size={15} aria-hidden="true" /><span>Sort:</span><select aria-label="Sort services" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
        </div>
        <div className="listing-count"><span>{data?.pagination?.total ?? services.length} services to explore</span><span>All vendors, one good place.</span></div>
        {isLoading && <p className="state-message" role="status">Finding thoughtful vendors…</p>}
        {error && <p className="state-message state-error" role="alert">{error.message} Check back in a moment.</p>}
        {!isLoading && !error && services.length === 0 && <div className="empty-state"><span className="eyebrow">A LITTLE MORE ROOM TO LOOK</span><h2>No matches just yet.</h2><p>Try another location or clear a category filter to see more services.</p><button type="button" className="text-button" onClick={() => { setSearch(''); setLocation(''); setCategory('') }}>Clear filters</button></div>}
        {services.length > 0 && <div className="browse-grid">{services.map((service) => <ServiceCard key={service._id.toString()} service={service} />)}</div>}
      </main>
    </>
  )
}
