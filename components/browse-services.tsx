'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Heart, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

type Service = {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  vendor?: { name?: string; businessName?: string }
}

const categories = ['Photography & Videography', 'Wedding Venues', 'Decoration & Florist', 'Catering Services', 'Makeup & Styling', 'Wedding Fashion']

async function fetchServices(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error ?? 'Services are unavailable right now.')
  return result as { items: Service[]; pagination: { total: number } }
}

export function BrowseServices({ initialCategory = '', initialLocation = '', initialSearch = '' }: { initialCategory?: string; initialLocation?: string; initialSearch?: string }) {
  const [query, setQuery] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [location, setLocation] = useState(initialLocation)
  const [sort, setSort] = useState('recommended')
  const searchParams = useMemo(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('search', query.trim())
    if (category) params.set('category', category)
    if (location.trim()) params.set('location', location.trim())
    if (sort !== 'recommended') params.set('sort', sort)
    return params.toString()
  }, [category, location, query, sort])
  const { data, error, isLoading } = useSWR(`/api/platform/services${searchParams ? `?${searchParams}` : ''}`, fetchServices)
  const items = data?.items ?? []

  return <><SiteHeader /><main className="browse-page"><div className="browse-topline"><Link href="/" className="back-link"><ArrowLeft size={15} /> Home</Link><span>THE WEDPLAN DIRECTORY</span></div><section className="browse-intro"><span className="eyebrow">A GOOD PLACE TO BEGIN</span><h1>Find your <em>people.</em></h1><p>Thoughtful vendors for all the little things that make your day yours.</p></section><div className="browse-search"><label><Search size={18} /><input aria-label="Search services" placeholder="Try ‘garden venue’ or ‘photographer’" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span /><label><MapPin size={18} /><input aria-label="Filter by location" placeholder="Anywhere" value={location} onChange={(event) => setLocation(event.target.value)} /></label></div><div className="browse-controls"><div className="category-filters" aria-label="Filter by category"><button onClick={() => setCategory('')} className={!category ? 'filter-chip active' : 'filter-chip'}>All services</button>{categories.map((item) => <button key={item} onClick={() => setCategory(category === item ? '' : item)} className={category === item ? 'filter-chip active' : 'filter-chip'}>{item}</button>)}</div><label className="sort-control"><SlidersHorizontal size={15} /><span>Sort:</span><select aria-label="Sort services" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div><div className="listing-count"><span>{data?.pagination.total ?? items.length} services to explore</span><span>Approved vendors, all in one place.</span></div>{isLoading ? <p className="service-state" role="status">Finding your vendors…</p> : error ? <p className="service-error" role="alert">{error.message}</p> : items.length ? <div className="browse-grid">{items.map((item) => <article className="service-card" key={item._id}><Link href={`/services/${encodeURIComponent(item._id)}`} className="service-photo">{item.images?.[0] && <Image src={item.images[0]} alt={`${item.serviceName} portfolio`} fill sizes="(max-width: 700px) 100vw, 33vw" className="object-cover" />}<span className="image-tag">{item.category}</span></Link><div className="service-card-content"><div className="service-title-line"><h3>{item.serviceName}</h3><Heart size={16} aria-hidden="true" /></div><p className="vendor-name">{item.vendor?.businessName || item.vendor?.name || 'WedPlan vendor'}</p><p className="service-location"><MapPin size={14} /> {item.location}</p><div className="service-price"><span>Starting at</span><strong>${Number(item.price).toLocaleString()}</strong></div><Link className="text-link" href={`/services/${encodeURIComponent(item._id)}`}>View details <ArrowUpRight size={15} /></Link></div></article>)}</div> : <div className="service-empty"><Search size={22} /><h3>No services found yet.</h3><p>Try a different search or check back as new vendors join WedPlan.</p></div>}</main></>
}
