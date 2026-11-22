import { auth } from '@/lib/auth'

const apiBase = (process.env.WEDPLAN_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')
const methods = ['GET', 'POST', 'PATCH', 'DELETE'] as const

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params
    const incoming = new URL(request.url)
    const target = `${apiBase}/api/${path.map(encodeURIComponent).join('/')}${incoming.search}`
    const tokenResult = await auth.api.getToken({ headers: request.headers }).catch(() => null)
    const token = tokenResult?.token
    const headers = new Headers()
    const contentType = request.headers.get('content-type')
    if (contentType) headers.set('content-type', contentType)
    if (token) headers.set('authorization', `Bearer ${token}`)

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      cache: 'no-store',
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    })
  } catch {
    return Response.json({ error: 'The WedPlan service is temporarily unavailable.' }, { status: 502 })
  }
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const DELETE = proxy
