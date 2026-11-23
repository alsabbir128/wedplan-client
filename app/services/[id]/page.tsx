import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { MapPin } from 'lucide-react'
import { SiteHeader } from '@/components/wedplan-home'
import { BookingForm } from '@/components/marketplace/booking-form'
import { auth } from '@/lib/auth'
import { fetchPublicService } from '@/lib/api-server'
import { formatPrice, MarketplaceService } from '@/lib/marketplace-data'

export const metadata: Metadata = {
  title: 'Wedding service details | WedPlan',
  description: 'Learn more about this wedding professional and send a booking request.',
}

type ServicePageProps = { params: Promise<{ id: string }> }

export default async function ServiceDetailsPage({ params }: ServicePageProps) {
  const { id } = await params
  const result = await fetchPublicService(id)
  if (result.status === 404) notFound()

  const service = result.service as MarketplaceService | null
  if (!service) {
    return <><SiteHeader /><main className="service-unavailable"><span className="eyebrow">ONE MOMENT</span><h1>We couldn&apos;t load this service.</h1><p>{result.status === 503 ? 'The vendor directory is temporarily unavailable. Please try again shortly.' : 'This listing may no longer be available.'}</p><Link className="text-link" href="/browse">Back to all vendors</Link></main></>
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const canRequest = session?.user?.role === 'customer'
  const image = service.images?.[0] || '/placeholder.jpg'
  const vendorName = service.businessName || service.vendorName || 'Wedding professional'

  return (
    <>
      <SiteHeader />
      <main className="service-detail-page">
        <Link className="back-link" href="/browse">Back to vendors</Link>
        <div className="service-detail-layout">
          <div className="service-detail-main">
            <div className="service-detail-image"><Image src={image} alt={`${service.serviceName} by ${vendorName}`} fill priority sizes="(max-width: 800px) 100vw, 65vw" className="object-cover" /></div>
            <span className="eyebrow">{service.category}</span>
            <h1>{service.serviceName}</h1>
            <p className="service-detail-vendor">{vendorName} <span>·</span> <MapPin size={15} aria-hidden="true" /> {service.location}</p>
            <p className="service-detail-description">{service.description}</p>
          </div>
          <aside className="booking-panel" aria-labelledby="booking-title">
            <span className="eyebrow">LET&apos;S MAKE IT HAPPEN</span>
            <h2 id="booking-title">Start a conversation</h2>
            <p className="booking-price">Starting at <strong>{formatPrice(service.price)}</strong></p>
            <BookingForm serviceId={id} canRequest={canRequest} />
          </aside>
        </div>
      </main>
    </>
  )
}
