'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { apiRequest } from '@/lib/api'
import { SERVICE_CATEGORIES } from '@/lib/marketplace-data'
import { SiteHeader } from '@/components/wedplan-home'

export function VendorApplicationForm() {
  const [form, setForm] = useState<{ businessName: string; category: string; location: string; description: string; phone: string; website: string }>({ businessName: '', category: SERVICE_CATEGORIES[0].value, location: '', description: '', phone: '', website: '' })
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await apiRequest('/vendors/apply', { method: 'POST', authenticated: true, body: form })
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not submit your application.')
    } finally {
      setPending(false)
    }
  }

  return <><SiteHeader /><main className="dashboard-page vendor-apply-page">
    <Link className="back-link" href="/customer">Back to your dashboard</Link>
    <div className="dashboard-heading"><span className="eyebrow">FOR THE PEOPLE BEHIND THE MAGIC</span><h1>Join as a vendor</h1><p>Tell us about your work. Our team reviews every application before a profile goes live.</p></div>
    {submitted ? <div className="booking-success" role="status"><strong>Your application is in review.</strong><p>We&apos;ll update your account when an administrator has reviewed your details.</p><Link className="text-link" href="/customer">Back to dashboard</Link></div> : <form onSubmit={handleSubmit} className="profile-form">
      <label className="form-field"><span>Business name</span><input required maxLength={100} value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} /></label>
      <label className="form-field"><span>Service category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{SERVICE_CATEGORIES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
      <label className="form-field"><span>Location</span><input required maxLength={160} placeholder="City, region, or destination" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label>
      <label className="form-field"><span>About your business</span><textarea required rows={5} maxLength={2400} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label className="form-field"><span>Phone <small>(optional)</small></span><input type="tel" maxLength={40} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
      <label className="form-field"><span>Website <small>(optional)</small></span><input type="url" maxLength={500} placeholder="https://" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" disabled={pending}>{pending ? 'Submitting…' : 'Submit for review'}</button>
    </form>}
  </main></>
}
