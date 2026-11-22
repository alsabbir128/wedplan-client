'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChangeEvent, FormEvent, useState } from 'react'
import useSWR from 'swr'
import { apiRequest } from '@/lib/api'
import { ApiList, Booking, MarketplaceService, recordId, SERVICE_CATEGORIES } from '@/lib/marketplace-data'
import { SiteHeader } from '@/components/wedplan-home'

type VendorProfile = { businessName: string; category: string; location: string; description: string; phone?: string; website?: string; status?: string }
type VendorOverview = { profile: VendorProfile | null; application: { status: string } | null }
type Subscription = { status: string; isPremium: boolean; currentPeriodEnd?: string | null }
type ServiceDraft = { serviceName: string; category: string; location: string; description: string; price: string; images: string[] }

const emptyService: ServiceDraft = { serviceName: '', category: SERVICE_CATEGORIES[0].value, location: '', description: '', price: '', images: [] }

export function VendorDashboard() {
  const { data: vendorData, error: vendorError, isLoading: vendorLoading, mutate: mutateVendor } = useSWR('/vendors/me', (path) => apiRequest<VendorOverview>(path, { authenticated: true }))
  const { data: serviceData, error: serviceError, isLoading: serviceLoading, mutate: mutateServices } = useSWR('/services/mine', (path) => apiRequest<ApiList<MarketplaceService>>(path, { authenticated: true }))
  const { data: bookingData, error: bookingError, mutate: mutateBookings } = useSWR('/bookings/vendor', (path) => apiRequest<ApiList<Booking>>(path, { authenticated: true }))
  const { data: subscriptionData, mutate: mutateSubscription } = useSWR('/subscriptions/me', (path) => apiRequest<{ item: Subscription | null }>(path, { authenticated: true }))
  const [profileMessage, setProfileMessage] = useState('')
  const [serviceMessage, setServiceMessage] = useState('')
  const [profilePending, setProfilePending] = useState(false)
  const [servicePending, setServicePending] = useState(false)
  const [workingId, setWorkingId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState<ServiceDraft>(emptyService)
  const [billingMessage, setBillingMessage] = useState('')

  const profile = vendorData?.profile
  const subscription = subscriptionData?.item

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile) return
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(form.entries())
    setProfilePending(true)
    setProfileMessage('')
    try {
      await apiRequest('/vendors/me', { method: 'PATCH', authenticated: true, body })
      setProfileMessage('Your profile has been updated.')
      await mutateVendor()
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'We could not update your profile.')
    } finally {
      setProfilePending(false)
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    setServiceMessage('Uploading image…')
    try {
      const result = await apiRequest<{ url: string }>('/uploads/images', { method: 'POST', authenticated: true, body: form })
      setDraft((current) => ({ ...current, images: [...current.images, result.url].slice(0, 8) }))
      setServiceMessage('Image added to your service.')
    } catch (error) {
      setServiceMessage(error instanceof Error ? error.message : 'Image upload failed.')
    } finally {
      input.value = ''
    }
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServicePending(true)
    setServiceMessage('')
    try {
      const body = { ...draft, price: Number(draft.price) }
      await apiRequest(editingId ? `/services/${editingId}` : '/services', {
        method: editingId ? 'PATCH' : 'POST', authenticated: true, body,
      })
      setDraft(emptyService)
      setEditingId('')
      setServiceMessage(editingId ? 'Changes saved and sent for review.' : 'Service submitted for review.')
      await mutateServices()
    } catch (error) {
      setServiceMessage(error instanceof Error ? error.message : 'We could not save this service.')
    } finally {
      setServicePending(false)
    }
  }

  function startEditing(service: MarketplaceService) {
    setEditingId(recordId(service))
    setDraft({
      serviceName: service.serviceName,
      category: service.category,
      location: service.location,
      description: service.description,
      price: String(service.price),
      images: service.images ?? [],
    })
    document.getElementById('service-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function removeService(service: MarketplaceService) {
    const id = recordId(service)
    setWorkingId(id)
    setServiceMessage('')
    try {
      await apiRequest(`/services/${id}`, { method: 'DELETE', authenticated: true })
      setServiceMessage('Service removed from your listings.')
      await mutateServices()
    } catch (error) {
      setServiceMessage(error instanceof Error ? error.message : 'We could not remove this service.')
    } finally {
      setWorkingId('')
    }
  }

  async function respondToBooking(booking: Booking, status: 'accepted' | 'rejected') {
    const id = recordId(booking)
    setWorkingId(id)
    try {
      await apiRequest(`/bookings/${id}/status`, { method: 'PATCH', authenticated: true, body: { status } })
      await mutateBookings()
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : 'We could not update this request.')
    } finally {
      setWorkingId('')
    }
  }

  async function openBilling(path: 'checkout' | 'portal') {
    setBillingMessage('')
    try {
      const result = await apiRequest<{ url: string }>(`/subscriptions/${path}`, {
        method: 'POST', authenticated: true,
        headers: path === 'checkout' ? { 'Idempotency-Key': crypto.randomUUID() } : undefined,
      })
      window.location.assign(result.url)
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : 'Billing is temporarily unavailable.')
    }
  }

  async function refreshWorkspace() {
    await Promise.all([mutateVendor(), mutateServices(), mutateBookings(), mutateSubscription()])
  }

  return (
    <><SiteHeader /><main className="dashboard-page vendor-dashboard">
      <div className="dashboard-heading"><span className="eyebrow">YOUR BUSINESS, BEAUTIFULLY PRESENTED</span><h1>Vendor studio</h1><p>Manage your profile, services, and the conversations coming your way.</p></div>
      {vendorLoading && <p className="state-message" role="status">Loading your vendor workspace…</p>}
      {vendorError && <p className="state-message state-error" role="alert">{vendorError.message}</p>}
      {!vendorLoading && vendorData?.application && !profile && <div className="booking-success"><strong>Your application is {vendorData.application.status}.</strong><p>Approved vendors can create public service listings and respond to customer requests.</p><Link className="text-link" href="/customer">Customer dashboard</Link></div>}

      {profile && <>
        <section className="dashboard-section" aria-labelledby="vendor-profile-heading">
          <div className="dashboard-section-heading"><div><span className="eyebrow">YOUR INTRODUCTION</span><h2 id="vendor-profile-heading">Business profile</h2></div><button type="button" className="text-button" onClick={refreshWorkspace}>Refresh</button></div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label className="form-field"><span>Business name</span><input name="businessName" required maxLength={100} defaultValue={profile.businessName} /></label>
            <label className="form-field"><span>Category</span><select name="category" defaultValue={profile.category}>{SERVICE_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="form-field"><span>Location</span><input name="location" required maxLength={160} defaultValue={profile.location} /></label>
            <label className="form-field"><span>About your business</span><textarea name="description" required rows={4} maxLength={2400} defaultValue={profile.description} /></label>
            <label className="form-field"><span>Phone</span><input name="phone" type="tel" maxLength={40} defaultValue={profile.phone ?? ''} /></label>
            <label className="form-field"><span>Website</span><input name="website" type="url" maxLength={500} defaultValue={profile.website ?? ''} /></label>
            {profileMessage && <p className="state-message" role="status">{profileMessage}</p>}
            <button className="button" disabled={profilePending}>{profilePending ? 'Saving…' : 'Save profile'}</button>
          </form>
        </section>

        <section className="dashboard-section" aria-labelledby="service-editor-heading">
          <div className="dashboard-section-heading"><div><span className="eyebrow">YOUR WORK, OUT IN THE WORLD</span><h2 id="service-editor-heading">Services</h2></div><span className="status-pill">{serviceData?.items.length ?? 0} listings</span></div>
          <form id="service-editor" className="profile-form service-editor" onSubmit={saveService}>
            <h3>{editingId ? 'Edit a service' : 'Add a service'}</h3>
            <label className="form-field"><span>Service name</span><input required maxLength={100} value={draft.serviceName} onChange={(event) => setDraft({ ...draft, serviceName: event.target.value })} /></label>
            <label className="form-field"><span>Category</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{SERVICE_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="form-field"><span>Location</span><input required maxLength={160} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></label>
            <label className="form-field"><span>Description</span><textarea required rows={4} maxLength={2400} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
            <label className="form-field"><span>Starting price (USD)</span><input required type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} /></label>
            <label className="form-field"><span>Upload a portfolio image</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} /></label>
            {draft.images.length > 0 && <div className="vendor-image-list" aria-label="Uploaded portfolio images">{draft.images.map((image) => <div key={image}><Image src={image} alt="Uploaded portfolio preview" width={82} height={60} unoptimized /><button type="button" aria-label="Remove image" onClick={() => setDraft({ ...draft, images: draft.images.filter((item) => item !== image) })}>Remove</button></div>)}</div>}
            {serviceMessage && <p className="state-message" role="status">{serviceMessage}</p>}
            <div className="form-actions"><button className="button" disabled={servicePending}>{servicePending ? 'Saving…' : editingId ? 'Save changes for review' : 'Submit service for review'}</button>{editingId && <button className="text-button" type="button" onClick={() => { setEditingId(''); setDraft(emptyService) }}>Stop editing</button>}</div>
          </form>
          {serviceLoading && <p className="state-message" role="status">Loading services…</p>}
          {serviceError && <p className="state-message state-error" role="alert">{serviceError.message}</p>}
          <div className="vendor-service-list">{serviceData?.items.map((service) => {
            const id = recordId(service)
            return <article className="vendor-service-row" key={id}>
              <div><span className={`status-pill status-${service.status ?? 'pending'}`}>{service.status ?? 'pending'}</span><h3>{service.serviceName}</h3><p>{service.category} · {service.location}</p></div>
              <div className="form-actions"><button type="button" className="text-button" onClick={() => startEditing(service)}>Edit</button><button type="button" className="text-button text-danger" disabled={workingId === id} onClick={() => removeService(service)}>{workingId === id ? 'Removing…' : 'Remove'}</button></div>
            </article>
          })}</div>
        </section>

        <section className="dashboard-section" aria-labelledby="booking-requests-heading">
          <div className="dashboard-section-heading"><div><span className="eyebrow">A NEW CONVERSATION</span><h2 id="booking-requests-heading">Booking requests</h2></div></div>
          {bookingError && <p className="state-message state-error" role="alert">{bookingError.message}</p>}
          {!bookingError && (bookingData?.items.length ?? 0) === 0 && <p className="state-message">No customer requests yet. They&apos;ll appear here when someone reaches out.</p>}
          <div className="request-list">{bookingData?.items.map((booking) => {
            const id = recordId(booking)
            return <article className="request-card" key={id}><div className="request-card-heading"><div><span className={`status-pill status-${booking.status}`}>{booking.status}</span><h3>{booking.serviceName || 'Wedding service request'}</h3></div><time dateTime={booking.eventDate}>{new Date(`${booking.eventDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></div><p>{booking.eventLocation}</p>{booking.message && <blockquote>{booking.message}</blockquote>}{booking.status === 'pending' && <div className="form-actions"><button type="button" className="button" disabled={workingId === id} onClick={() => respondToBooking(booking, 'accepted')}>Accept request</button><button type="button" className="text-button" disabled={workingId === id} onClick={() => respondToBooking(booking, 'rejected')}>Decline</button></div>}</article>
          })}</div>
        </section>

        <section className="dashboard-section billing-section" aria-labelledby="billing-heading">
          <div className="dashboard-section-heading"><div><span className="eyebrow">GROW YOUR REACH</span><h2 id="billing-heading">Premium plan</h2></div><span className={`status-pill ${subscription?.isPremium ? 'status-approved' : ''}`}>{subscription?.isPremium ? 'Premium active' : subscription?.status ?? 'Free plan'}</span></div>
          <p>Subscribe to the monthly premium plan to unlock vendor benefits. Your price is managed in Stripe and is never sent from the browser.</p>
          {subscription?.currentPeriodEnd && <p>Current period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>}
          {billingMessage && <p className="state-message state-error" role="alert">{billingMessage}</p>}
          <button type="button" className="button" onClick={() => openBilling(subscription?.isPremium ? 'portal' : 'checkout')}>{subscription?.isPremium ? 'Manage subscription' : 'Choose premium'}</button>
        </section>
      </>}
    </main></>
  )
}
