'use client'

import { useState } from 'react'
import useSWR from 'swr'

const paths = { users: '/api/platform/admin/users', services: '/api/platform/admin/services', transactions: '/api/platform/admin/transactions' } as const
async function fetchList(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Could not load administration data.')
  return data as { items: Array<Record<string, any>> }
}

export function AdminManagement({ section }: { section: keyof typeof paths }) {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [actionError, setActionError] = useState('')
  const queryParams = new URLSearchParams()
  if (section === 'users' && search.trim()) queryParams.set('search', search.trim())
  if (section === 'users' && role) queryParams.set('role', role)
  const query = queryParams.size ? `?${queryParams.toString()}` : ''
  const { data, error, isLoading, mutate } = useSWR(`${paths[section]}${query}`, fetchList)
  const title = section === 'users' ? 'Manage users' : section === 'services' ? 'Manage services' : 'Transactions'

  async function act(url: string, method: string, body?: unknown) {
    setActionError('')
    try {
      const response = await fetch(url, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
      const result = response.status === 204 ? null : await response.json()
      if (!response.ok) throw new Error(result?.error ?? 'Action could not be completed.')
      await mutate()
    } catch (actionFailure) {
      setActionError(actionFailure instanceof Error ? actionFailure.message : 'Action could not be completed.')
    }
  }

  return <section className="vendor-services"><header className="vendor-services-heading"><div><span className="eyebrow">PLATFORM ADMINISTRATION</span><h1>{title}</h1><p>Review account and marketplace activity with server-verified access.</p></div></header>{section === 'users' && <div className="browse-search"><label><span className="sr-only">Search users</span><input aria-label="Search users by name or email" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" /></label><label><span className="sr-only">Filter by role</span><select aria-label="Filter users by role" value={role} onChange={(event) => setRole(event.target.value)}><option value="">All roles</option><option value="customer">Customers</option><option value="vendor">Vendors</option><option value="admin">Admins</option></select></label></div>}{actionError && <p className="service-error" role="alert">{actionError}</p>}{isLoading ? <p className="service-state" role="status">Loading…</p> : error ? <p className="service-error" role="alert">{error.message}</p> : !data?.items.length ? <div className="service-empty"><h3>Nothing to review yet.</h3><p>New platform activity will appear here.</p></div> : <div className="vendor-service-cards">{data.items.map((item) => <article className="vendor-service-card" key={String(item._id)}>{section === 'users' && <><div className="vendor-service-card-top"><div><span className="service-status">{item.role}</span><h3>{item.name || 'Unnamed account'}</h3><p>{item.email}</p></div><span>{item.isBlocked ? 'Blocked' : 'Active'}</span></div><button type="button" className={item.isBlocked ? '' : 'service-delete'} onClick={() => act(`${paths.users}/${encodeURIComponent(String(item._id))}/block`, 'PATCH', { isBlocked: !item.isBlocked })}>{item.isBlocked ? 'Unblock account' : 'Block account'}</button></>}{section === 'services' && <><div className="vendor-service-card-top"><div><span className={`service-status status-${item.status}`}>{item.status}</span><h3>{item.serviceName}</h3><p>{item.category} · {item.location} · ${Number(item.price).toLocaleString()}</p></div></div><p>{item.description}</p><div className="vendor-service-actions">{item.status !== 'approved' && <><button type="button" onClick={() => act(`${paths.services}/${encodeURIComponent(String(item._id))}/review`, 'PATCH', { status: 'approved', isActive: true })}>Approve & publish</button><button type="button" onClick={() => act(`${paths.services}/${encodeURIComponent(String(item._id))}/review`, 'PATCH', { status: 'approved', isActive: false })}>Approve inactive</button></>}{item.status !== 'rejected' && <button type="button" className="service-delete" onClick={() => act(`${paths.services}/${encodeURIComponent(String(item._id))}/review`, 'PATCH', { status: 'rejected', isActive: false })}>Reject</button>}<button type="button" className="service-delete" onClick={() => act(`${paths.services}/${encodeURIComponent(String(item._id))}`, 'DELETE')}>Remove</button></div></>}{section === 'transactions' && <><div className="vendor-service-card-top"><div><span className={`service-status status-${item.status}`}>{item.status}</span><h3>{item.plan} subscription</h3><p>Vendor {String(item.vendorId)}</p></div><strong>{String(item.currency ?? 'usd').toUpperCase()} {(Number(item.amount ?? 0) / 100).toFixed(2)}</strong></div><p>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Date unavailable'}</p></>}</article>)}</div>}</section>
}
