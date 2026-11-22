'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, MapPin, Menu, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { apiRequest } from '@/lib/api'
import { ApiList, MarketplaceService, SERVICE_CATEGORIES } from '@/lib/marketplace-data'
import { ServiceCard } from '@/components/marketplace/service-card'

const categories = [
  { name: 'Venues', value: 'Wedding Venues', detail: 'Spaces made for your story', image: 'photo-1519167758481-83f550bb49b3' },
  { name: 'Photography', value: 'Photography & Videography', detail: 'Keep every little moment', image: 'photo-1537633552985-df8429e8048b' },
  { name: 'Florals & decor', value: 'Decoration & Florist', detail: 'The details that feel like you', image: 'photo-1490750967868-88aa4486c946' },
  { name: 'Catering', value: 'Catering Services', detail: 'A table worth gathering around', image: 'photo-1414235077428-338989a2e8c0' },
]

function Photo({ id, alt, className = '' }: { id: string; alt: string; className?: string }) {
  return <Image src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`} alt={alt} fill sizes="(max-width: 700px) 100vw, 33vw" className={`object-cover ${className}`} />
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { data: session } = authClient.useSession()
  const role = (session?.user as unknown as { role?: string } | undefined)?.role
  const dashboardHref = role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/customer'

  async function signOut() {
    setSigningOut(true)
    await authClient.signOut()
    window.location.assign('/')
  }

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="WedPlan home"><span className="brand-heart"><Heart size={17} fill="currentColor" /></span> wedplan<span className="brand-period">.</span></Link>
      <nav className="main-nav" aria-label="Main navigation"><Link href="/browse">Find vendors</Link><Link href="/#how-it-works">How it works</Link><Link href="/#inspiration">Inspiration</Link></nav>
      <div className="header-actions">
        <Link href="/browse" className="header-search" aria-label="Search vendors"><Search size={18} /></Link>
        {session?.user ? <><Link className="login-link" href={dashboardHref}>My dashboard</Link><button className="header-signout" type="button" disabled={signingOut} onClick={signOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button></> : <><Link className="login-link" href="/sign-in">Log in</Link><Link className="button button-small" href="/sign-up">Get started <ArrowUpRight size={15} /></Link></>}
      </div>
      <button className="mobile-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><Link href="/browse" onClick={() => setMenuOpen(false)}>Find vendors</Link><Link href="/#how-it-works" onClick={() => setMenuOpen(false)}>How it works</Link><Link href="/#inspiration" onClick={() => setMenuOpen(false)}>Inspiration</Link>{session?.user ? <><Link href={dashboardHref} onClick={() => setMenuOpen(false)}>My dashboard</Link><button type="button" onClick={signOut}>Sign out</button></> : <><Link href="/sign-in" onClick={() => setMenuOpen(false)}>Log in</Link><Link href="/sign-up" onClick={() => setMenuOpen(false)}>Create an account</Link></>}</nav>}
    </header>
  )
}

function FeaturedServices() {
  const { data, error, isLoading } = useSWR('/services?limit=3&sort=recommended', (path) => apiRequest<ApiList<MarketplaceService>>(path))
  const services = data?.items ?? []

  return <div className="service-grid">
    {isLoading && <p className="state-message" role="status">Finding vendors to feature…</p>}
    {error && <p className="state-message">Vendor listings are temporarily unavailable.</p>}
    {!isLoading && !error && services.length === 0 && <p className="state-message">New vendor listings will appear here as they are approved.</p>}
    {services.map((service) => <ServiceCard key={service._id.toString()} service={service} />)}
  </div>
}

export default function WedPlanHome() {
  return <><SiteHeader /><main>
    <section className="hero"><Image src="/wedplan-hero.png" alt="A sunlit garden wedding ceremony surrounded by flowers" fill priority className="hero-image" /><div className="hero-shade" /><div className="hero-content"><span className="eyebrow hero-eyebrow"><Sparkles size={13} /> YOUR DAY, YOUR WAY</span><h1>The beginning of<br />your <em>forever</em> starts here.</h1><p>Find the people who make your day feel like you. Thoughtfully chosen wedding vendors, all in one place.</p><Link href="/browse" className="button hero-button">Explore wedding services <ArrowRight size={17} /></Link><div className="hero-proof"><span><Check size={15} /> Clear starting prices</span><span><Check size={15} /> Reviewed vendor profiles</span></div></div><div className="hero-caption"><span>YOUR STORY, YOUR WAY</span><span>THOUGHTFUL PEOPLE FOR EVERY KIND OF CELEBRATION</span></div><div className="hero-side-note">MADE FOR YOUR KIND OF LOVE</div></section>
    <section className="search-section" aria-label="Search wedding services"><div className="search-intro"><span className="eyebrow">LET&apos;S FIND YOUR PEOPLE</span><h2>What are you dreaming of?</h2></div><form className="search-bar" action="/browse"><label className="search-field"><MapPin size={18} aria-hidden="true" /><span><small>Where</small><input name="location" placeholder="City or destination" /></span></label><span className="search-divider" aria-hidden="true" /><label className="search-field"><Heart size={18} aria-hidden="true" /><span><small>What you need</small><select name="category" defaultValue=""><option value="">Choose a service</option>{SERVICE_CATEGORIES.map((category) => <option value={category.value} key={category.value}>{category.label}</option>)}</select></span><ChevronDown size={15} aria-hidden="true" /></label><button type="submit" className="search-submit" aria-label="Search vendors"><Search size={19} /></button></form><p className="search-hint">Popular: <Link href="/browse?category=Wedding%20Venues">Venues</Link><span>·</span><Link href="/browse?category=Photography%20%26%20Videography">Photographers</Link><span>·</span><Link href="/browse?category=Decoration%20%26%20Florist">Florists</Link></p></section>
    <section className="section-wrap category-section" id="inspiration"><div className="section-heading"><div><span className="eyebrow">A LITTLE INSPIRATION</span><h2>Find your kind of <em>something.</em></h2><p>Good things happen when you find the right fit.</p></div><Link href="/browse" className="text-link">Explore all categories <ArrowRight size={16} /></Link></div><div className="category-grid">{categories.map((category) => <Link href={`/browse?category=${encodeURIComponent(category.value)}`} className="category-card" key={category.name}><div className="category-photo"><Photo id={category.image} alt={`${category.name} wedding inspiration`} /></div><div className="category-copy"><span>EXPLORE</span><h3>{category.name}</h3><p>{category.detail}</p></div><ArrowUpRight className="category-arrow" size={19} aria-hidden="true" /></Link>)}</div></section>
    <section className="section-wrap featured-section"><div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Wonderful people, <em>beautiful work.</em></h2><p>Browse real listings from approved wedding professionals.</p></div><Link href="/browse" className="text-link">See all vendors <ArrowRight size={16} /></Link></div><FeaturedServices /></section>
    <section className="promise-section" id="how-it-works"><div className="promise-image"><Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85" alt="A couple celebrating their wedding day outdoors" fill sizes="(max-width: 700px) 100vw, 50vw" className="object-cover" /></div><div className="promise-copy"><span className="eyebrow">A LITTLE LESS OVERWHELMED</span><h2>Planning should feel like <em>part of the magic.</em></h2><p>Skip the endless tabs and crossed fingers. WedPlan brings good people, clear details, and the next right step into one thoughtful place.</p><div className="promise-points"><p><span><Check size={15} /></span>Real portfolios and clear starting prices</p><p><span><Check size={15} /></span>One place for the people and plans you love</p><p><span><Check size={15} /></span>Vendor profiles reviewed before they go live</p></div><Link href="/browse" className="text-link">Meet your vendors <ArrowRight size={16} /></Link><div className="promise-seal"><ShieldCheck size={18} /><span>THOUGHTFULLY<br />REVIEWED VENDORS</span></div></div></section>
    <section className="closing-cta"><span className="eyebrow">YOUR STORY, BEAUTIFULLY TOLD</span><h2>Ready when <em>you are.</em></h2><p>Your people are out there. Let&apos;s find them.</p><Link href="/browse" className="button">Start exploring <ArrowRight size={17} /></Link><span className="cta-flower" aria-hidden="true">✳</span></section>
  </main><footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Link className="wordmark" href="/"><span className="brand-heart"><Heart size={17} fill="currentColor" /></span> wedplan<span className="brand-period">.</span></Link><p>For the day you&apos;ve been dreaming of,<br />and the people who make it yours.</p></div><div className="footer-links"><div><span>THE GOOD STUFF</span><Link href="/browse">Find vendors</Link><Link href="/#inspiration">Get inspired</Link><Link href="/#how-it-works">How it works</Link></div><div><span>FOR VENDORS</span><Link href="/vendor/apply">Apply as a vendor</Link><Link href="/sign-up">Create an account</Link></div></div><Link className="footer-top" href="#">Back to top ↑</Link></div><div className="footer-bottom"><span>© 2026 WedPlan. Planning made a little more lovely.</span><Link href="/browse">Browse services</Link></div></footer></>
}
