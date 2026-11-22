import { CustomerBookings } from '@/components/customer-bookings'
import { requireRole } from '@/lib/session'

export default async function CustomerBookingsPage() {
  await requireRole('customer')
  return <CustomerBookings />
}
