'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'

type Service = { _id: string; serviceName: string; category: string; description: string; price: number; location: string; images: string[]; vendor?: { name?: string; businessName?: string } }

export function ServiceDetail({ service }: { service: Service }) {
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  async function requestBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFeedback('')
    setError('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      const response = await fetch('/api/platform/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ serviceId: service._id, eventDate: form.get('eventDate'), eventLocation: form.get('eventLocation'), message: form.get('message') }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not send your request.')
      setFeedback('Your booking request was sent. You can track it from your dashboard.')
      formElement.reset()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send your request. Please try again.')
    } finally { setPending(false) }
  }

  return <main className="browse-page"><Link href="/browse" className="back-link"><ArrowLeft size={15} /> Browse services</Link><article className="vendor-services"><header className="vendor-services-heading"><div><span className="eyebrow">{service.category}</span><h1>{service.serviceName}</h1><p><MapPin size={15} /> {service.location} · {service.vendor?.businessName || service.vendor?.name || 'WedPlan vendor'}</p></div><strong>From ${Number(service.price).toLocaleString()}</strong></header><div className="browse-grid">{service.images?.map((image, index) => <div className="service-photo" key={image}><Image src={image} alt={`${service.serviceName} portfolio image ${index + 1}`} fill sizes="(max-width: 700px) 100vw, 33vw" className="object-cover" /></div>)}</div><section className="vendor-service-form-section"><h2>About this service</h2><p>{service.description}</p><h2><CalendarDays size={18} /> Request a date</h2><form className="vendor-service-form" onSubmit={requestBooking}><label>Event date<input name="eventDate" type="date" required min={new Date().toISOString().slice(0, 10)} /></label><label>Event location<input name="eventLocation" required maxLength={240} placeholder="City or venue" /></label><label className="form-wide">A note for the vendor<textarea name="message" maxLength={2000} rows={4} placeholder="Share a little about your celebration." /></label><button className="service-submit" type="submit" disabled={pending}>{pending ? 'Sending request…' : 'Send booking request'}</button></form>{feedback && <p className="service-feedback" role="status">{feedback}</p>}{error && <p className="service-error" role="alert">{error}</p>}</section></article></main>
}
