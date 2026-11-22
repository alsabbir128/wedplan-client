import { DashboardShell } from '@/components/dashboard-shell'
import { requireSignedInUser } from '@/lib/session'

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSignedInUser()
  const role = user.role
  if (role !== 'customer' && role !== 'vendor' && role !== 'admin') {
    return null
  }

  return (
    <DashboardShell role={role} name={user.name} email={user.email}>
      {children}
    </DashboardShell>
  )
}
