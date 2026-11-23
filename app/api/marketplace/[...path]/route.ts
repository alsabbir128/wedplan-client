type RouteContext = { params: Promise<{ path: string[] }> }

async function proxy(request: Request, { params }: RouteContext) {
  const origin = process.env.API_SERVER_ORIGIN
    ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '')
  if (!origin) return Response.json({ error: 'The marketplace API is not configured.' }, { status: 503 })

  try {
    const { path } = await params
    const target = new URL(`/api/${path.map((segment) => encodeURIComponent(segment)).join('/')}`, origin)
    target.search = new URL(request.url).search
    const headers = new Headers()
    for (const name of ['authorization', 'content-type', 'idempotency-key']) {
      const value = request.headers.get(name)
      if (value) headers.set(name, value)
    }

    const method = request.method.toUpperCase()
    const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.arrayBuffer()
    if (body && body.byteLength > 6 * 1024 * 1024) {
      return Response.json({ error: 'The request body is too large.' }, { status: 413 })
    }

    const response = await fetch(target, {
      method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
    const responseBody = await response.arrayBuffer()
    const responseHeaders = new Headers({ 'cache-control': 'no-store' })
    const contentType = response.headers.get('content-type')
    if (contentType) responseHeaders.set('content-type', contentType)
    return new Response(responseBody, { status: response.status, headers: responseHeaders })
  } catch {
    return Response.json({ error: 'The marketplace API is temporarily unavailable.' }, { status: 502 })
  }
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const DELETE = proxy
