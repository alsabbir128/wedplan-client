'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Heart, MapPin, Search, SlidersHorizontal, Star } from 'lucide-react'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'

const listings = [
  { name: 'The Conservatory', category: 'Venues', city: 'Hudson Valley, NY', price: 8500, rating: '4.98', image: 'photo-1519167758481-83f550bb49b3', vendor: 'The Conservatory Estate' },
  { name: 'Ever After Studio', category: 'Photography', city: 'Brooklyn, NY', price: 3200, rating: '5.0', image: 'photo-1537633552985-df8429e8048b', vendor: 'Maya Bennett' },
  { name: 'Petal & Stem', category: 'Florals & decor', city: 'New York, NY', price: 1800, rating: '4.96', image: 'photo-1490750967868-88aa4486c946', vendor: 'Petal & Stem Co.' },
  { name: 'Maison Rosé', category: 'Catering', city: 'Manhattan, NY', price: 4600, rating: '4.92', image: 'photo-1414235077428-338989a2e8c0', vendor: 'Maison Rosé Events' },
  { name: 'Willow & Thread', category: 'Wedding fashion', city: 'Queens, NY', price: 2400, rating: '4.95', image: 'photo-1594552072238-b8a33785b261', vendor: 'Willow Bridal Atelier' },
  { name: 'Golden Hour Beauty', category: 'Makeup & styling', city: 'Brooklyn, NY', price: 950, rating: '4.97', image: 'photo-1522335789203-aabd1fc54bc9', vendor: 'Sofia Laurent' },
]
const categories = ['All services', 'Venues', 'Photography', 'Florals & decor', 'Catering', 'Wedding fashion', 'Makeup & styling']

export default function BrowsePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All services')
  const [location, setLocation] = useState('')
  const [sort, setSort] = useState('featured')
  const filtered = useMemo(() => listings.filter((item) => (category === 'All services' || item.category === category) && `${item.name} ${item.category} ${item.vendor}`.toLowerCase().includes(query.toLowerCase()) && item.city.toLowerCase().includes(location.toLowerCase())).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0), [category, location, query, sort])
  return <><SiteHeader /><main className="browse-page"><div className="browse-topline"><Link href="/" className="back-link"><ArrowLeft size={15} /> Home</Link><span>THE WEDPLAN DIRECTORY</span></div><section className="browse-intro"><span className="eyebrow">A GOOD PLACE TO BEGIN</span><h1>Find your <em>people.</em></h1><p>Thoughtful vendors for all the little things that make your day yours.</p></section><div className="browse-search"><label><Search size={18} /><input aria-label="Search vendors" placeholder="Try ‘garden venue’ or ‘photographer’" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span /><label><MapPin size={18} /><input aria-label="Filter by location" placeholder="Anywhere" value={location} onChange={(event) => setLocation(event.target.value)} /></label></div><div className="browse-controls"><div className="category-filters" aria-label="Filter by category">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? 'filter-chip active' : 'filter-chip'}>{item}</button>)}</div><label className="sort-control"><SlidersHorizontal size={15} /><span>Sort:</span><select aria-label="Sort services" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><div className="listing-count"><span>{filtered.length} lovely {filtered.length === 1 ? 'find' : 'finds'} to explore</span><span>All vendors, one good place.</span></div>{filtered.length ? <div className="browse-grid">{filtered.map((item) => <article className="service-card" key={item.name}><Link href="/sign-in" className="service-photo"><Image src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=1000&q=85`} alt={`${item.name} ${item.category}`} fill sizes="(max-width: 700px) 100vw, 33vw" className="object-cover" /><span className="image-tag">{item.category}</span><button className="save-button" aria-label={`Save ${item.name}`}><Heart size={17} /></button></Link><div className="service-card-content"><div className="service-title-line"><h2>{item.name}</h2><span className="rating"><Star size={13} fill="currentColor" /> {item.rating}</span></div><p className="vendor-name">{item.vendor}</p><p className="service-location"><MapPin size={14} /> {item.city}</p><div className="service-price"><span>Starting at</span><strong>${item.price.toLocaleString()}</strong><Link href="/sign-in" aria-label={`View ${item.name}`}><ArrowUpRight size={17} /></Link></div></div></article>)}</div> : <div className="empty-results"><span><Search size={21} /></span><h2>No matches just yet</h2><p>Try another search or clear a filter to see more lovely vendors.</p><button onClick={() => { setQuery(''); setCategory('All services'); setLocation('') }}>Clear filters</button></div>}<div className="browse-note">A note from us: listings shown here are sample content for this first build step.</div></main></>
}
