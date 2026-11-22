import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export type AccountRole = 'customer' | 'vendor' | 'admin'

export async function requireSignedInUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const user = session.user as typeof session.user & { role?: AccountRole; isBlocked?: boolean }
  if (user.isBlocked) redirect('/sign-in?blocked=1')
  return user
}

export async function requireRole(role: AccountRole) {
  const user = await requireSignedInUser()
  if (user.role !== role) redirect('/dashboard')
  return user
}
