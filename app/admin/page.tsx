import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/marketplace/admin-dashboard'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Admin studio | WedPlan' }

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  if (session.user.isBlocked) redirect('/sign-in?blocked=1')
  if (session.user.role !== 'admin') redirect(session.user.role === 'vendor' ? '/vendor' : '/customer')
  return <AdminDashboard />
}
