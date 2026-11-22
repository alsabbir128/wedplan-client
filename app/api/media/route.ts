import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import { database } from '@/lib/mongodb'

const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_SIZE + 64 * 1024) {
    return NextResponse.json({ error: 'Images must be smaller than 8 MB.' }, { status: 413 })
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in to upload a profile or service image.' }, { status: 401 })
  const user = await database.collection<{ _id: ObjectId; id?: string; isBlocked?: boolean }>('users').findOne({
    $or: [
      ...(ObjectId.isValid(session.user.id) ? [{ _id: new ObjectId(session.user.id) }] : []),
      { id: session.user.id },
    ],
  }, { projection: { isBlocked: 1 } })
  if (!user || user.isBlocked) return NextResponse.json({ error: 'This account cannot upload images.' }, { status: 403 })
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Image uploads are not configured yet.' }, { status: 503 })

  try {
    const form = await request.formData()
    const image = form.get('image')
    if (!(image instanceof File)) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 })
    if (!allowedTypes.has(image.type)) return NextResponse.json({ error: 'Use a JPEG, PNG, WebP, or AVIF image.' }, { status: 400 })
    if (image.size < 1 || image.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'Images must be smaller than 8 MB.' }, { status: 400 })

    const payload = new FormData()
    payload.set('image', Buffer.from(await image.arrayBuffer()).toString('base64'))
    const upload = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: payload,
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    })
    const result = await upload.json()
    if (!upload.ok || !result.success || typeof result.data?.url !== 'string') {
      return NextResponse.json({ error: 'The image host could not save this image. Try another file.' }, { status: 502 })
    }
    return NextResponse.json({ url: result.data.display_url ?? result.data.url })
  } catch {
    return NextResponse.json({ error: 'Image upload failed. Please try again.' }, { status: 502 })
  }
}
