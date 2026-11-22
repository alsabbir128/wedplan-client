'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarDays, Compass, CreditCard, Heart, LayoutDashboard, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import type { AccountRole } from '@/lib/session'

type DashboardShellProps = {
  children: React.ReactNode
  email: string
  name: string
  role: AccountRole
}

const roleLabels: Record<AccountRole, string> = {
  customer: 'Couple account',
  vendor: 'Vendor account',
  admin: 'Administrator',
}

export function DashboardShell({ children, email, name, role }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(false)
  const dashboardPath = `/dashboard/${role}`

  async function signOut() {
    if (pending) return
    setPending(true)
    await authClient.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-greeting">
          <small>{roleLabels[role]}</small>
          <h2>{name || 'Welcome'}</h2>
          <p>{email}</p>
        </div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link href={dashboardPath} aria-current={pathname === dashboardPath ? 'page' : undefined}><LayoutDashboard /> Overview</Link>
          {role === 'vendor' && <Link href="/dashboard/vendor/services" aria-current={pathname.startsWith('/dashboard/vendor/services') ? 'page' : undefined}><BriefcaseBusiness /> My services</Link>}
          {role === 'vendor' && <Link href="/dashboard/vendor/bookings" aria-current={pathname.startsWith('/dashboard/vendor/bookings') ? 'page' : undefined}><CalendarDays /> Booking requests</Link>}
          {role === 'vendor' && <Link href="/dashboard/vendor/subscription" aria-current={pathname.startsWith('/dashboard/vendor/subscription') ? 'page' : undefined}><CreditCard /> Subscription</Link>}
          {role === 'customer' && <Link href="/dashboard/customer/bookings" aria-current={pathname.startsWith('/dashboard/customer/bookings') ? 'page' : undefined}><CalendarDays /> My bookings</Link>}
          {role === 'admin' && <>
            <Link href="/dashboard/admin/users" aria-current={pathname.startsWith('/dashboard/admin/users') ? 'page' : undefined}><ShieldCheck /> Manage users</Link>
            <Link href="/dashboard/admin/services" aria-current={pathname.startsWith('/dashboard/admin/services') ? 'page' : undefined}><BriefcaseBusiness /> Manage services</Link>
            <Link href="/dashboard/admin/transactions" aria-current={pathname.startsWith('/dashboard/admin/transactions') ? 'page' : undefined}><CreditCard /> Transactions</Link>
          </>}
          <Link href="/dashboard/profile" aria-current={pathname.startsWith('/dashboard/profile') ? 'page' : undefined}><UserRound /> Profile settings</Link>
          <Link href="/browse"><Compass /> Browse services</Link>
          <Link href="/"><Heart /> WedPlan home</Link>
        </nav>
        <div className="dashboard-sidebar-bottom">
          <p>Planning should feel like part of the magic.</p>
          <button type="button" onClick={signOut} disabled={pending}>
            <LogOut /> {pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
        <Link className="dashboard-mobile-home" href="/"><ArrowLeft /> Back to WedPlan</Link>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  )
}
