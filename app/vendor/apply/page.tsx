import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { VendorApplicationForm } from '@/components/marketplace/vendor-application-form'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Apply as a vendor | WedPlan' }

export default async function VendorApplyPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?next=%2Fvendor%2Fapply')
  if (session.user.isBlocked) redirect('/sign-in?blocked=1')
  if (session.user.role === 'vendor') redirect('/vendor')
  if (session.user.role === 'admin') redirect('/admin')
  return <VendorApplicationForm />
}
