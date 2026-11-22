'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { CalendarDays, MapPin } from 'lucide-react'
import { useState } from 'react'

async function fetchBookings(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error ?? 'Could not load your bookings.')
  return result as { items: Array<{ _id: string; eventDate: string; eventLocation: string; message: string; status: string; service?: { serviceName?: string; images?: string[] }; vendor?: { businessName?: string; name?: string } }> }
}

export function CustomerBookings() {
  const { data, error, isLoading, mutate } = useSWR('/api/platform/bookings/mine', fetchBookings)
  const [cancelError, setCancelError] = useState('')
  const [workingId, setWorkingId] = useState('')
  async function cancel(id: string) {
    setCancelError('')
    setWorkingId(id)
    try {
      const response = await fetch(`/api/platform/bookings/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not cancel this request.')
      await mutate()
    } catch (cancelFailure) {
      setCancelError(cancelFailure instanceof Error ? cancelFailure.message : 'Could not cancel this request.')
    } finally { setWorkingId('') }
  }
  if (isLoading) return <p className="service-state" role="status">Loading your booking requests…</p>
  if (error) return <p className="service-error" role="alert">{error.message}</p>
  if (!data?.items.length) return <div className="service-empty"><CalendarDays size={22} /><h3>Your plans start here.</h3><p>Explore vendors and send a booking request when you find the right fit.</p><Link className="text-link" href="/browse">Browse services</Link></div>
  return <section className="vendor-services"><header className="vendor-services-heading"><div><span className="eyebrow">YOUR CELEBRATION</span><h1>My bookings</h1><p>Every request and reply, together in one place.</p></div></header>{cancelError && <p className="service-error" role="alert">{cancelError}</p>}<div className="vendor-service-cards">{data.items.map((booking) => <article className="vendor-service-card" key={booking._id}>{booking.service?.images?.[0] && <div className="service-photo"><Image src={booking.service.images[0]} alt="Service portfolio" fill sizes="320px" className="object-cover" /></div>}<div className="vendor-service-card-top"><div><span className={`service-status status-${booking.status}`}>{booking.status}</span><h3>{booking.service?.serviceName ?? 'Wedding service'}</h3><p>{booking.vendor?.businessName || booking.vendor?.name || 'WedPlan vendor'}</p></div><time dateTime={booking.eventDate}>{new Date(`${booking.eventDate}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}</time></div><p className="booking-location"><MapPin size={15} /> {booking.eventLocation}</p>{booking.message && <p className="vendor-service-description">{booking.message}</p>}{booking.status === 'pending' && <button type="button" className="service-delete" disabled={workingId === booking._id} onClick={() => cancel(booking._id)}>{workingId === booking._id ? 'Cancelling…' : 'Cancel request'}</button>}</article>)}</div></section>
}
