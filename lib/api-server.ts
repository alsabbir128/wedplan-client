import 'server-only'

export async function fetchPublicService(id: string) {
  const origin = process.env.API_SERVER_ORIGIN
    ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '')
  if (!origin) return { status: 503, service: null }

  try {
    const response = await fetch(new URL(`/api/services/${encodeURIComponent(id)}`, origin), { cache: 'no-store' })
    if (!response.ok) return { status: response.status, service: null }
    const payload = await response.json()
    return { status: response.status, service: payload.item ?? null }
  } catch {
    return { status: 503, service: null }
  }
}
