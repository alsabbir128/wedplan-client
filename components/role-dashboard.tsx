import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { AccountRole } from '@/lib/session'
import type { DashboardStat } from '@/lib/dashboard-data'

const dashboardCopy: Record<AccountRole, { label: string; title: string; description: string; nextTitle: string; nextText: string; action: string; href: string }> = {
  customer: {
    label: 'YOUR WEDDING, YOUR WAY',
    title: 'Your plans, all in one place.',
    description: 'Keep track of the people and details making your day yours.',
    nextTitle: 'A lovely place to begin',
    nextText: 'Explore approved wedding services, send booking requests, and follow every reply from your dashboard.',
    action: 'Explore wedding services',
    href: '/browse',
  },
  vendor: {
    label: 'YOUR BUSINESS, BEAUTIFULLY SHARED',
    title: 'Welcome to your studio.',
    description: 'Your services and booking requests will live here as you build your WedPlan presence.',
    nextTitle: 'Make room for your next client',
    nextText: 'Create your first service, review booking requests, or compare plans as your business grows.',
    action: 'Manage your services',
    href: '/dashboard/vendor/services',
  },
  admin: {
    label: 'WEDPLAN OPERATIONS',
    title: 'A clear view of the marketplace.',
    description: 'Review platform activity and keep the WedPlan community in good shape.',
    nextTitle: 'Thoughtful moderation starts here',
    nextText: 'Review submitted services, manage accounts, and inspect verified subscription transactions.',
    action: 'Review submitted services',
    href: '/dashboard/admin/services',
  },
}

export function RoleDashboard({ role, name, stats }: { role: AccountRole; name: string; stats: DashboardStat[] }) {
  const content = dashboardCopy[role]
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> {content.label}</span>
          <h1>{content.title}</h1>
          <p>{name ? `Good to have you here, ${name}. ` : ''}{content.description}</p>
        </div>
      </div>
      <section className="dashboard-stat-grid" aria-label="Account overview">
        {stats.map((stat) => (
          <article className="dashboard-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value.toLocaleString()}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </section>
      <section className="dashboard-next">
        <span className="eyebrow">A GOOD NEXT STEP</span>
        <h2>{content.nextTitle}</h2>
        <p>{content.nextText}</p>
        <Link href={content.href} className="dashboard-action">{content.action} <ArrowRight size={15} /></Link>
      </section>
    </>
  )
}
