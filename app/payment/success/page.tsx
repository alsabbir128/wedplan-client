import Link from 'next/link'
import { requireRole } from '@/lib/session'

export default async function PaymentSuccessPage() {
  await requireRole('vendor')
  return <main className="browse-page"><section className="browse-intro"><span className="eyebrow">PAYMENT RECEIVED</span><h1>Thank you for <em>choosing Premium.</em></h1><p>Your subscription will activate as soon as Stripe confirms the payment through its secure webhook.</p><Link className="button" href="/dashboard/vendor/subscription">Return to your plan</Link></section></main>
}
