'use client'

import useSWR from 'swr'
import { CalendarDays, Check, Clock3, MapPin, X } from 'lucide-react'
import { useState } from 'react'

type Booking = {
  _id: string
  serviceId: string
  customerId: string
  eventDate: string
  eventLocation: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
}

async function fetchBookings(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Could not load booking requests.')
  return data as { items: Booking[] }
}

export function VendorBookings() {
  const { data, error, isLoading, mutate } = useSWR('/api/platform/bookings/vendor', fetchBookings)
  const [workingId, setWorkingId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [formError, setFormError] = useState('')

  async function updateStatus(booking: Booking, status: 'accepted' | 'rejected') {
    setWorkingId(booking._id)
    setFeedback('')
    setFormError('')
    try {
      const response = await fetch(`/api/platform/bookings/${encodeURIComponent(booking._id)}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'This request could not be updated.')
      await mutate()
      setFeedback(status === 'accepted' ? 'Booking request accepted.' : 'Booking request declined.')
    } catch (updateError) {
      setFormError(updateError instanceof Error ? updateError.message : 'This request could not be updated.')
    } finally {
      setWorkingId('')
    }
  }

  return (
    <section className="vendor-services">
      <header className="vendor-services-heading">
        <div><span className="eyebrow"><CalendarDays size={14} /> YOUR CALENDAR</span><h1>Booking requests</h1><p>Review the details and respond to each couple in one place.</p></div>
      </header>
      {feedback && <p className="service-feedback" role="status">{feedback}</p>}
      {formError && <p className="service-error" role="alert">{formError}</p>}
      <div className="vendor-section-title"><h2>Requests</h2><span>{data?.items.length ?? 0} total</span></div>
      {isLoading ? <p className="service-state">Loading booking requests…</p> : error ? <p className="service-error" role="alert">{error.message}</p> : !data?.items.length ? (
        <div className="service-empty"><Clock3 size={22} /><h3>No booking requests yet.</h3><p>New requests will appear here when couples reach out.</p></div>
      ) : (
        <div className="vendor-service-cards">
          {data.items.map((booking) => (
            <article className="vendor-service-card" key={booking._id}>
              <div className="vendor-service-card-top"><div><span className={`service-status status-${booking.status}`}>{booking.status}</span><h3>Wedding request</h3><p>Customer reference {booking.customerId.slice(-6)}</p></div><time dateTime={booking.eventDate}>{new Date(`${booking.eventDate}T12:00:00`).toLocaleDateString(undefined, { dateStyle: 'medium' })}</time></div>
              <p className="booking-location"><MapPin size={15} /> {booking.eventLocation}</p>
              <p className="vendor-service-description">{booking.message || 'No additional note was included.'}</p>
              <div className="vendor-service-actions">
                {booking.status === 'pending' && <>
                  <button type="button" disabled={workingId === booking._id} onClick={() => updateStatus(booking, 'accepted')}><Check size={14} /> Accept</button>
                  <button type="button" className="service-delete" disabled={workingId === booking._id} onClick={() => updateStatus(booking, 'rejected')}><X size={14} /> Decline</button>
                </>}
                {booking.status !== 'pending' && <span className="booking-final-note">This request has been {booking.status}.</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
