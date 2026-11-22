'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BadgeCheck, Check, Sparkles } from 'lucide-react'

export function VendorSubscription({ plan, cancelAtPeriodEnd }: { plan: string; cancelAtPeriodEnd: boolean }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [cancellationScheduled, setCancellationScheduled] = useState(cancelAtPeriodEnd)
  const premium = plan === 'premium'

  async function cancelSubscription() {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/platform/payments/cancel', { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not schedule cancellation.')
      setCancellationScheduled(true)
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Could not schedule cancellation.')
    } finally { setPending(false) }
  }

  async function upgrade() {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/platform/payments/checkout', {
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not start secure checkout.')
      if (!result.url) throw new Error('Checkout did not return a payment link.')
      window.location.assign(result.url)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Could not start secure checkout.')
      setPending(false)
    }
  }

  return <section className="vendor-services"><header className="vendor-services-heading"><div><span className="eyebrow"><Sparkles size={14} /> GROW YOUR BUSINESS</span><h1>Vendor plans</h1><p>Choose the plan that fits your business, with secure monthly billing.</p></div></header>{error && <p className="service-error" role="alert">{error}</p>}<div className="vendor-service-cards"><article className="vendor-service-card"><span className="service-status">CURRENT PLAN</span><h2>Free</h2><p>For getting started with your first listings.</p><strong>Free</strong><ul><li><Check size={15} /> Up to 3 active services</li><li><Check size={15} /> Vendor dashboard</li><li><Check size={15} /> Booking request management</li></ul>{!premium && <span>Your current plan</span>}</article><article className="vendor-service-card"><span className="service-status status-approved"><BadgeCheck size={14} /> {premium ? 'ACTIVE' : 'POPULAR'}</span><h2>Premium</h2><p>More room to grow and showcase your work.</p><strong>$19 <small>/ month</small></strong><ul><li><Check size={15} /> Unlimited active services</li><li><Check size={15} /> Premium vendor badge</li><li><Check size={15} /> All Free plan features</li></ul>{premium ? <><Link className="text-link" href="/dashboard/vendor">Manage your listings</Link>{cancellationScheduled ? <p role="status">Cancellation is scheduled. Premium access remains active through the current billing period.</p> : <button className="service-submit" type="button" onClick={cancelSubscription} disabled={pending}>{pending ? 'Scheduling cancellation…' : 'Cancel at period end'}</button>}</> : <button className="service-submit" type="button" onClick={upgrade} disabled={pending}>{pending ? 'Opening secure checkout…' : 'Upgrade to Premium'}</button>}</article></div><p className="service-state">Subscriptions are activated only after Stripe verifies the payment. You can manage billing from your Stripe receipt.</p></section>
}
