import Link from 'next/link'
import { requireRole } from '@/lib/session'

export default async function PaymentCancelPage() {
  await requireRole('vendor')
  return <main className="browse-page"><section className="browse-intro"><span className="eyebrow">CHECKOUT CANCELED</span><h1>No worries, <em>take your time.</em></h1><p>No payment was taken. You can continue with your current plan or try upgrading again later.</p><Link className="button" href="/dashboard/vendor/subscription">Back to plans</Link></section></main>
}
