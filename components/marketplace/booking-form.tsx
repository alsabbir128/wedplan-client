'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { apiRequest } from '@/lib/api'

export function BookingForm({ serviceId, canRequest }: { serviceId: string; canRequest: boolean }) {
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nativeEvent = event.nativeEvent as KeyboardEvent
    if (nativeEvent.isComposing || nativeEvent.keyCode === 229) return
    setError('')
    setPending(true)
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        authenticated: true,
        body: { serviceId, eventDate, eventLocation, message },
      })
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not send your request.')
    } finally {
      setPending(false)
    }
  }

  if (!canRequest) {
    return <div className="booking-locked"><p>Sign in with a customer account to send a booking request.</p><Link className="button" href="/sign-in">Sign in to continue</Link></div>
  }
  if (submitted) return <div className="booking-success" role="status"><strong>Your request is on its way.</strong><p>You can follow its status from your customer dashboard.</p><Link className="text-link" href="/customer">View my requests</Link></div>

  return (
    <form onSubmit={handleSubmit} className="stacked-form booking-form">
      <label className="form-field"><span>Wedding date</span><input type="date" required value={eventDate} onChange={(event) => setEventDate(event.target.value)} /></label>
      <label className="form-field"><span>Event location</span><input required maxLength={240} placeholder="City, venue, or destination" value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} /></label>
      <label className="form-field"><span>A note for the vendor <small>(optional)</small></span><textarea rows={4} maxLength={2000} placeholder="Tell them a little about what you have in mind" value={message} onChange={(event) => setMessage(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="button" disabled={pending}>{pending ? 'Sending request…' : 'Send booking request'}</button>
    </form>
  )
}
