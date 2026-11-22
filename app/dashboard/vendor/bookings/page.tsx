import { VendorBookings } from '@/components/vendor-bookings'
import { requireRole } from '@/lib/session'

export default async function VendorBookingsPage() {
  await requireRole('vendor')
  return <VendorBookings />
}
