import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { formatPrice, MarketplaceService, recordId } from '@/lib/marketplace-data'

export function ServiceCard({ service }: { service: MarketplaceService }) {
  const id = recordId(service)
  const image = service.images?.[0] || '/placeholder.jpg'
  const name = service.businessName || service.vendorName || 'Wedding professional'

  return (
    <article className="service-card">
      <Link href={`/services/${id}`} className="service-photo" aria-label={`View ${service.serviceName}`}>
        <Image src={image} alt={`${service.serviceName} by ${name}`} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" className="object-cover" />
        <span className="image-tag">{service.category}</span>
      </Link>
      <div className="service-card-content">
        <div className="service-title-line">
          <h2><Link href={`/services/${id}`}>{service.serviceName}</Link></h2>
          <span className="rating"><Star size={13} aria-hidden="true" /> New</span>
        </div>
        <p className="vendor-name">{name}</p>
        <p className="service-location"><MapPin size={14} aria-hidden="true" /> {service.location}</p>
        <div className="service-price"><span>Starting at</span><strong>{formatPrice(service.price)}</strong></div>
      </div>
    </article>
  )
}
