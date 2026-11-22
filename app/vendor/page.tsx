import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { VendorDashboard } from '@/components/marketplace/vendor-dashboard'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Vendor studio | WedPlan' }

export default async function VendorPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  if (session.user.isBlocked) redirect('/sign-in?blocked=1')
  if (session.user.role === 'admin') redirect('/admin')
  if (session.user.role !== 'vendor') redirect('/vendor/apply')
  return <VendorDashboard />
}
