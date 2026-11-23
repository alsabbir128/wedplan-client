'use client'

import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { apiRequest } from '@/lib/api'
import { ApiList, Booking, recordId } from '@/lib/marketplace-data'
import { SiteHeader } from '@/components/wedplan-home'

export function CustomerDashboard() {
  const { data, error, isLoading, mutate } = useSWR('/bookings/mine', (path) => apiRequest<ApiList<Booking>>(path, { authenticated: true }))
  const { data: vendorInfo } = useSWR('/vendors/me', (path) => apiRequest<{ application: { status: string } | null }>(path, { authenticated: true }))
  const [workingId, setWorkingId] = useState('')
  const [notice, setNotice] = useState('')

  async function cancelBooking(booking: Booking) {
    const id = recordId(booking)
    setWorkingId(id)
    setNotice('')
    try {
      await apiRequest(`/bookings/${id}`, { method: 'DELETE', authenticated: true })
      setNotice('Your pending request was cancelled.')
      await mutate()
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : 'We could not cancel this request.')
    } finally {
      setWorkingId('')
    }
  }

  return (
    <><SiteHeader /><main className="dashboard-page">
      <div className="dashboard-heading"><span className="eyebrow">YOUR PLANS, ALL IN ONE PLACE</span><h1>Your requests</h1><p>Keep an eye on the conversations shaping your day.</p></div>
      {vendorInfo?.application?.status === 'pending' && <div className="booking-success" role="status"><strong>Your vendor application is in review.</strong><p>We&apos;ll update your account after an administrator reviews your details.</p></div>}
      {(!vendorInfo?.application || vendorInfo.application.status === 'rejected') && <p><Link className="button button-small" href="/vendor/apply">{vendorInfo?.application?.status === 'rejected' ? 'Update and reapply as a vendor' : 'Apply to join as a vendor'}</Link></p>}
      {notice && <p className="state-message" role="status">{notice}</p>}
      {isLoading && <p className="state-message" role="status">Loading your requests…</p>}
      {error && <p className="state-message state-error" role="alert">{error.message}</p>}
      {!isLoading && !error && (data?.items.length ?? 0) === 0 && <div className="empty-state"><span className="eyebrow">YOUR NEXT GOOD FIND</span><h2>No requests yet.</h2><p>Browse thoughtful vendors and send a note when someone feels like the right fit.</p><Link className="button" href="/browse">Explore vendors</Link></div>}
      {data?.items && data.items.length > 0 && <div className="request-list">{data.items.map((booking) => {
        const id = recordId(booking)
        return <article className="request-card" key={id}>
          <div className="request-card-heading"><div><span className={`status-pill status-${booking.status}`}>{booking.status}</span><h2>{booking.serviceName || 'Wedding service request'}</h2></div><time dateTime={booking.eventDate}>{new Date(`${booking.eventDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>
          <p>{booking.eventLocation}</p>
          {booking.message && <blockquote>{booking.message}</blockquote>}
          <div className="request-card-footer"><span>Request sent {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>{booking.status === 'pending' && <button className="text-button" type="button" disabled={workingId === id} onClick={() => cancelBooking(booking)}>{workingId === id ? 'Cancelling…' : 'Cancel request'}</button>}</div>
        </article>
      })}</div>}
    </main></>
  )
}
