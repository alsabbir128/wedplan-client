import { VendorServices } from '@/components/vendor-services'
import { requireRole } from '@/lib/session'

export default async function VendorServicesPage() {
  await requireRole('vendor')
  return <VendorServices />
}
