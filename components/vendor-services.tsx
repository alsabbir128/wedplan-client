'use client'

import { useState, type FormEvent } from 'react'
import useSWR from 'swr'
import { ArrowRight, BriefcaseBusiness, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'

type Service = {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected' | 'deleted'
  isActive: boolean
}

type ServiceForm = Omit<Service, '_id' | 'status' | 'isActive' | 'images'> & { imageUrl: string }
const categories = ['Photography & Videography', 'Wedding Venues', 'Decoration & Florist', 'Catering Services', 'Makeup & Styling', 'Wedding Fashion']
const blankForm: ServiceForm = { serviceName: '', category: categories[0], description: '', price: 0, location: '', imageUrl: '' }

async function fetchServices(url: string) {
  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Could not load your services.')
  return data as { items: Service[] }
}

export function VendorServices() {
  const { data, error, isLoading, mutate } = useSWR('/api/platform/services/mine', fetchServices)
  const [form, setForm] = useState<ServiceForm>(blankForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [formError, setFormError] = useState('')

  function startEdit(service: Service) {
    setEditingId(service._id)
    setForm({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: service.price,
      location: service.location,
      imageUrl: service.images?.[0] ?? '',
    })
    setFeedback('')
    setFormError('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(blankForm)
    setFormError('')
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFeedback('')
    setFormError('')
    try {
      const response = await fetch(editingId ? `/api/platform/services/${encodeURIComponent(editingId)}` : '/api/platform/services', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          serviceName: form.serviceName,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          location: form.location,
          images: [form.imageUrl],
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not save this service.')
      await mutate()
      setFeedback(editingId ? 'Your changes were saved. The service is back in review.' : 'Your service was submitted for review.')
      resetForm()
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Could not save this service. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function removeService(id: string) {
    setFeedback('')
    try {
      const response = await fetch(`/api/platform/services/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error ?? 'Could not remove this service.')
      }
      await mutate()
      setFeedback('Service removed from your profile.')
    } catch (removeError) {
      setFormError(removeError instanceof Error ? removeError.message : 'Could not remove this service.')
    }
  }

  async function setAvailability(service: Service) {
    setFormError('')
    setFeedback('')
    try {
      const response = await fetch(`/api/platform/services/${encodeURIComponent(service._id)}/availability`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isActive: !service.isActive }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not update availability.')
      await mutate()
      setFeedback(service.isActive ? 'Service paused.' : 'Service is now visible in the marketplace.')
    } catch (availabilityError) {
      setFormError(availabilityError instanceof Error ? availabilityError.message : 'Could not update availability.')
    }
  }

  return (
    <div className="vendor-services">
      <header className="vendor-services-heading">
        <div>
          <span className="eyebrow"><BriefcaseBusiness size={14} /> YOUR OFFERINGS</span>
          <h1>My services</h1>
          <p>Share what you do best. New and updated services go through a quick review before they appear.</p>
        </div>
        <a className="dashboard-action" href="#service-form">Add a service <ArrowRight size={15} /></a>
      </header>

      {feedback && <p className="service-feedback" role="status">{feedback}</p>}
      {formError && <p className="service-error" role="alert">{formError}</p>}

      <section className="vendor-service-list" aria-label="Your services">
        <div className="vendor-section-title"><h2>Service list</h2><span>{data?.items.length ?? 0} services</span></div>
        {isLoading ? <p className="service-state">Loading your services…</p> : error ? <p className="service-error" role="alert">{error.message}</p> : !data?.items.length ? (
          <div className="service-empty"><ImagePlus size={22} /><h3>Your next great listing starts here.</h3><p>Add your first service and submit it for review.</p></div>
        ) : (
          <div className="vendor-service-cards">
            {data.items.map((service) => (
              <article className="vendor-service-card" key={service._id}>
                <div className="vendor-service-card-top">
                  <div><span className={`service-status status-${service.status}`}>{service.status}</span><h3>{service.serviceName}</h3><p>{service.category} · {service.location}</p></div>
                  <strong>${Number(service.price).toLocaleString()}</strong>
                </div>
                <p className="vendor-service-description">{service.description}</p>
                <div className="vendor-service-actions">
                  {service.status === 'approved' && <button type="button" onClick={() => setAvailability(service)}>{service.isActive ? 'Pause listing' : 'Publish listing'}</button>}
                  <button type="button" onClick={() => startEdit(service)}><Pencil size={14} /> Edit</button>
                  <button type="button" className="service-delete" onClick={() => removeService(service._id)}><Trash2 size={14} /> Remove</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="vendor-service-form-section" id="service-form">
        <div className="vendor-section-title"><div><span className="eyebrow">{editingId ? 'REFINE YOUR LISTING' : 'A NEW OFFERING'}</span><h2>{editingId ? 'Edit service' : 'Add a service'}</h2></div>{editingId && <button className="service-cancel-edit" type="button" onClick={resetForm}><X size={14} /> Cancel edit</button>}</div>
        <form className="vendor-service-form" onSubmit={saveService}>
          <label>Service name<input required maxLength={120} value={form.serviceName} onChange={(event) => setForm({ ...form, serviceName: event.target.value })} placeholder="e.g. Full-day wedding photography" /></label>
          <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="form-wide">Description<textarea required minLength={20} maxLength={5000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Tell couples what makes your service special." /></label>
          <label>Starting price<input required min={1} max={10000000} type="number" value={form.price || ''} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} placeholder="2500" /></label>
          <label>Location<input required maxLength={240} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Brooklyn, NY" /></label>
          <label className="form-wide">Service image URL<input required type="url" inputMode="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" /><small>Use a secure HTTPS image link. Image upload will be added with the media integration.</small></label>
          <button className="service-submit" type="submit" disabled={pending}>{pending ? 'Saving…' : editingId ? 'Save changes' : <><Plus size={15} /> Submit for review</>}</button>
        </form>
      </section>
    </div>
  )
}
