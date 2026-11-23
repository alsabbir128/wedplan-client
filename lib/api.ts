import { authClient } from '@/lib/auth-client'

export type ApiRequestOptions = Omit<RequestInit, 'body'> & { authenticated?: boolean; body?: unknown }

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { authenticated = false, headers: inputHeaders, body, ...requestOptions } = options
  const headers = new Headers(inputHeaders)
  let requestBody: BodyInit | null | undefined

  if (authenticated) {
    const tokenResult = await authClient.token()
    const token = tokenResult.data?.token
    if (tokenResult.error || !token) throw new Error('Please sign in again to continue.')
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (body == null) {
    requestBody = body
  } else if (
    typeof body === 'string'
    || body instanceof FormData
    || body instanceof Blob
    || body instanceof URLSearchParams
    || body instanceof ArrayBuffer
    || ArrayBuffer.isView(body)
  ) {
    requestBody = body as BodyInit
  } else {
    headers.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  const apiPath = path.startsWith('/api/') ? path.slice(4) : path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`/api/marketplace${apiPath}`, {
    ...requestOptions,
    body: requestBody,
    headers,
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : 'The request could not be completed.')
  }
  return payload as T
}

export function apiFetcher<T>(path: string) {
  return apiRequest<T>(path)
}
