'use client'

import { useState, type FormEvent } from 'react'
import { ImageUploadField } from '@/components/image-upload-field'

type Profile = { name: string; email: string; role: string; businessName?: string; image?: string | null }

export function ProfileSettings({ user }: { user: Profile }) {
  const [pending, setPending] = useState(false)
  const [image, setImage] = useState(user.image ?? '')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFeedback('')
    setError('')
    const form = new FormData(event.currentTarget)
    const payload: Record<string, string> = { name: String(form.get('name') ?? ''), image }
    if (user.role === 'vendor') payload.businessName = String(form.get('businessName') ?? '')
    try {
      const response = await fetch('/api/platform/profile', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not save your profile.')
      setFeedback('Your profile has been updated.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.')
    } finally { setPending(false) }
  }
  return <section className="vendor-services"><header className="vendor-services-heading"><div><span className="eyebrow">ACCOUNT DETAILS</span><h1>Profile settings</h1><p>Keep your contact information current.</p></div></header><form className="vendor-service-form" onSubmit={save}><label>Full name<input name="name" required minLength={2} maxLength={100} defaultValue={user.name} /></label><label>Email<input type="email" value={user.email} readOnly disabled /></label>{user.role === 'vendor' && <label>Business name<input name="businessName" required minLength={2} maxLength={120} defaultValue={user.businessName ?? ''} /></label>}<ImageUploadField id="profile-image" label="Profile image" value={image} onChange={setImage} /><button className="service-submit" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</button></form>{feedback && <p className="service-feedback" role="status">{feedback}</p>}{error && <p className="service-error" role="alert">{error}</p>}</section>
}
