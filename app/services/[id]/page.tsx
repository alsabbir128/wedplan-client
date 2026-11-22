import { notFound } from 'next/navigation'
import { ServiceDetail } from '@/components/service-detail'
import { requireSignedInUser } from '@/lib/session'

type ServicePageProps = { params: Promise<{ id: string }> }

export default async function ServicePage({ params }: ServicePageProps) {
  await requireSignedInUser()
  const { id } = await params
  const apiBase = (process.env.WEDPLAN_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')
  const response = await fetch(`${apiBase}/api/services/${encodeURIComponent(id)}`, { cache: 'no-store' }).catch(() => null)
  if (!response?.ok) notFound()
  const result = await response.json()
  if (!result.item) notFound()
  return <ServiceDetail service={result.item} />
}
