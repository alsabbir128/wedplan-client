export const SERVICE_CATEGORIES = [
  { value: 'Wedding Venues', label: 'Venues' },
  { value: 'Photography & Videography', label: 'Photography' },
  { value: 'Decoration & Florist', label: 'Florals & decor' },
  { value: 'Catering Services', label: 'Catering' },
  { value: 'Makeup & Styling', label: 'Makeup & styling' },
  { value: 'Wedding Fashion', label: 'Wedding fashion' },
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]['value']

export type MarketplaceService = {
  _id: string | { $oid: string }
  serviceName: string
  category: string
  location: string
  description: string
  price: number
  images?: string[]
  vendorId: string
  vendorName?: string
  businessName?: string
  status?: 'pending' | 'approved' | 'rejected'
  isActive?: boolean
  createdAt?: string
}

export type Booking = {
  _id: string | { $oid: string }
  serviceId: string | { $oid: string }
  serviceName?: string
  vendorId: string
  customerId: string
  eventDate: string
  eventLocation: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
}

export type ApiList<T> = { items: T[] }

export function recordId(value: { _id?: string | { $oid?: string }; id?: string }) {
  if (typeof value._id === 'string') return value._id
  if (value._id && typeof value._id.$oid === 'string') return value._id.$oid
  return value.id ?? ''
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}
