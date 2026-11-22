import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { CustomerDashboard } from '@/components/marketplace/customer-dashboard'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'My wedding requests | WedPlan' }

export default async function CustomerPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  if (session.user.isBlocked) redirect('/sign-in?blocked=1')
  if (session.user.role === 'vendor') redirect('/vendor')
  if (session.user.role === 'admin') redirect('/admin')
  return <CustomerDashboard />
}
