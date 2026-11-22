import { VendorSubscription } from '@/components/vendor-subscription'
import { requireRole } from '@/lib/session'

export default async function VendorSubscriptionPage() {
  const user = await requireRole('vendor')
  return <VendorSubscription plan={user.subscriptionPlan ?? 'free'} cancelAtPeriodEnd={Boolean(user.subscriptionCancelAtPeriodEnd)} />
}
