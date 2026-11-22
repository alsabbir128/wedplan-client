'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Heart, Menu, Search, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function SiteHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const account = session?.user as { role?: string; name?: string } | undefined
  const destination = account ? '/dashboard' : '/sign-in'

  async function signOut() {
    await authClient.signOut()
    setMenuOpen(false)
    router.replace('/')
    router.refresh()
  }

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="WedPlan home"><span className="brand-heart"><Heart size={17} fill="currentColor" /></span> wedplan<span className="brand-period">.</span></Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/browse">Find vendors</Link>
        <a href="/#how-it-works">How it works</a>
        <a href="/#inspiration">Inspiration</a>
      </nav>
      <div className="header-actions">
        <Link href="/browse" className="header-search" aria-label="Search vendors"><Search size={18} /></Link>
        {account ? (
          <>
            <Link className="login-link" href={destination}>{account.name || 'Dashboard'}</Link>
            <button className="header-signout" type="button" onClick={signOut}>Log out</button>
          </>
        ) : (
          <>
            <Link className="login-link" href="/sign-in">Log in</Link>
            <Link className="button button-small" href="/sign-up">Get started <ArrowUpRight size={15} /></Link>
          </>
        )}
      </div>
      <button className="mobile-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/browse" onClick={() => setMenuOpen(false)}>Find vendors</Link>
          <Link href={destination} onClick={() => setMenuOpen(false)}>{account ? 'Dashboard' : 'Log in'}</Link>
          {account ? <button type="button" onClick={signOut}>Log out</button> : <Link href="/sign-up" onClick={() => setMenuOpen(false)}>Create account</Link>}
        </nav>
      )}
    </header>
  )
}
