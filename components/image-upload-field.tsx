'use client'

import { useState, type ChangeEvent } from 'react'
import { ImagePlus } from 'lucide-react'

export function ImageUploadField({ id, value, onChange, label = 'Image' }: { id: string; value: string; onChange: (url: string) => void; label?: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPending(true)
    setError('')
    const form = new FormData()
    form.set('image', file)
    try {
      const response = await fetch('/api/media', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not upload this image.')
      onChange(result.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload this image.')
    } finally {
      setPending(false)
      event.target.value = ''
    }
  }
  return <div className="form-wide"><label htmlFor={id}>{label}</label><input id={id} type="url" inputMode="url" value={value} onChange={(event) => onChange(event.target.value)} placeholder="https://…" /><label className="image-upload-control" htmlFor={`${id}-file`}><ImagePlus size={15} />{pending ? 'Uploading image…' : 'Choose an image file (max 8 MB)'}</label><input id={`${id}-file`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} disabled={pending} className="sr-only" />{error && <small role="alert">{error}</small>}{!error && <small>Upload JPEG, PNG, WebP, or AVIF. You can also paste a secure HTTPS image URL.</small>}</div>
}
