'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { apiRequest } from '@/lib/api'
import { ApiList, MarketplaceService, recordId } from '@/lib/marketplace-data'
import { SiteHeader } from '@/components/wedplan-home'

type Overview = { customers: number; vendors: number; pendingVendors: number; activeServices: number; pendingServices: number; bookings: number; activeSubscriptions: number }
type AdminUser = { _id: string | { $oid: string }; name: string; email: string; role: string; isBlocked?: boolean; createdAt?: string }
type VendorApplication = { _id: string | { $oid: string }; businessName: string; category: string; location: string; contactEmail: string; status: string }
type Transaction = { _id?: string; vendorId: string; stripeSubscriptionId: string; status: string; isPremium: boolean; currentPeriodEnd?: string }

export function AdminDashboard() {
  const { data: overview } = useSWR('/admin/overview', (path) => apiRequest<Overview>(path, { authenticated: true }))
  const [userSearch, setUserSearch] = useState('')
  const { data: users, error: usersError, mutate: mutateUsers } = useSWR(`/admin/users?search=${encodeURIComponent(userSearch)}`, (path) => apiRequest<ApiList<AdminUser>>(path, { authenticated: true }))
  const { data: vendors, error: vendorsError, mutate: mutateVendors } = useSWR('/admin/vendors', (path) => apiRequest<ApiList<VendorApplication>>(path, { authenticated: true }))
  const { data: services, error: servicesError, mutate: mutateServices } = useSWR('/admin/services', (path) => apiRequest<ApiList<MarketplaceService>>(path, { authenticated: true }))
  const { data: transactions, error: transactionsError } = useSWR('/admin/transactions', (path) => apiRequest<ApiList<Transaction>>(path, { authenticated: true }))
  const [pendingId, setPendingId] = useState('')
  const [message, setMessage] = useState('')

  async function update(path: string, method: 'PATCH' | 'DELETE', body?: unknown) {
    setPendingId(path)
    setMessage('')
    try {
      await apiRequest(path, { method, authenticated: true, body })
      await Promise.all([mutateUsers(), mutateVendors(), mutateServices()])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not complete this action.')
    } finally {
      setPendingId('')
    }
  }

  const metrics = [
    ['Customers', overview?.customers], ['Vendors', overview?.vendors], ['Vendor reviews', overview?.pendingVendors],
    ['Live services', overview?.activeServices], ['Service reviews', overview?.pendingServices], ['Premium plans', overview?.activeSubscriptions],
  ] as const

  return <><SiteHeader /><main className="dashboard-page admin-dashboard">
    <div className="dashboard-heading"><span className="eyebrow">KEEPING THE MARKETPLACE THOUGHTFUL</span><h1>Admin studio</h1><p>Review membership, listings, and subscription activity.</p></div>
    <section className="admin-metrics" aria-label="Marketplace overview">{metrics.map(([label, value]) => <article className="metric-card" key={label}><span>{label}</span><strong>{value ?? '—'}</strong></article>)}</section>
    {message && <p className="state-message state-error" role="alert">{message}</p>}

    <section className="dashboard-section" aria-labelledby="users-heading"><div className="dashboard-section-heading"><div><span className="eyebrow">THE COMMUNITY</span><h2 id="users-heading">Users</h2></div><label className="admin-search"><span className="sr-only">Search users</span><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search name or email" /></label></div>
      {usersError && <p className="state-message state-error" role="alert">{usersError.message}</p>}
      <div className="admin-list">{users?.items.map((user) => { const id = recordId(user); const path = `/admin/users/${id}/status`; return <article className="admin-row" key={id}><div><h3>{user.name || user.email}</h3><p>{user.email} · {user.role}</p></div><div className="form-actions"><span className={`status-pill ${user.isBlocked ? 'status-rejected' : 'status-approved'}`}>{user.isBlocked ? 'Blocked' : 'Active'}</span><button type="button" className="text-button" disabled={pendingId === path} onClick={() => update(path, 'PATCH', { isBlocked: !user.isBlocked })}>{user.isBlocked ? 'Restore' : 'Block'}</button></div></article> })}</div>
    </section>

    <section className="dashboard-section" aria-labelledby="vendors-heading"><div className="dashboard-section-heading"><div><span className="eyebrow">MEET THE PROFESSIONALS</span><h2 id="vendors-heading">Vendor applications</h2></div></div>
      {vendorsError && <p className="state-message state-error" role="alert">{vendorsError.message}</p>}
      <div className="admin-list">{vendors?.items.map((vendor) => { const id = recordId(vendor); const path = `/admin/vendors/${id}/status`; return <article className="admin-row" key={id}><div><span className={`status-pill status-${vendor.status}`}>{vendor.status}</span><h3>{vendor.businessName}</h3><p>{vendor.category} · {vendor.location} · {vendor.contactEmail}</p></div>{vendor.status === 'pending' && <div className="form-actions"><button type="button" className="button" disabled={pendingId === path} onClick={() => update(path, 'PATCH', { status: 'approved' })}>Approve</button><button type="button" className="text-button" disabled={pendingId === path} onClick={() => update(path, 'PATCH', { status: 'rejected' })}>Decline</button></div>}</article> })}</div>
    </section>

    <section className="dashboard-section" aria-labelledby="services-heading"><div className="dashboard-section-heading"><div><span className="eyebrow">A GOOD FIT FOR EVERY COUPLE</span><h2 id="services-heading">Published services</h2></div></div>
      {servicesError && <p className="state-message state-error" role="alert">{servicesError.message}</p>}
      <div className="admin-list">{services?.items.map((service) => { const id = recordId(service); const path = `/admin/services/${id}/status`; return <article className="admin-row" key={id}><div><span className={`status-pill status-${service.status ?? 'pending'}`}>{service.status ?? 'pending'}</span><h3>{service.serviceName}</h3><p>{service.category} · {service.location}</p></div>{service.status !== 'approved' && <div className="form-actions"><button type="button" className="button" disabled={pendingId === path} onClick={() => update(path, 'PATCH', { status: 'approved' })}>Approve</button><button type="button" className="text-button" disabled={pendingId === path} onClick={() => update(path, 'PATCH', { status: 'rejected' })}>Decline</button></div>}</article> })}</div>
    </section>

    <section className="dashboard-section" aria-labelledby="transactions-heading"><div className="dashboard-section-heading"><div><span className="eyebrow">BILLING ACTIVITY</span><h2 id="transactions-heading">Subscriptions</h2></div></div>
      {transactionsError && <p className="state-message state-error" role="alert">{transactionsError.message}</p>}
      <div className="admin-list">{transactions?.items.map((item, index) => <article className="admin-row" key={item.stripeSubscriptionId || `${item.vendorId}-${index}`}><div><h3>{item.status}</h3><p>Vendor {item.vendorId} · {item.stripeSubscriptionId}</p></div><span className={`status-pill ${item.isPremium ? 'status-approved' : ''}`}>{item.isPremium ? 'Premium active' : 'Not active'}</span></article>)}</div>
    </section>
  </main></>
}
