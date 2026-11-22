import { RoleDashboard } from '@/components/role-dashboard'
import { getDashboardStats } from '@/lib/dashboard-data'
import { requireRole } from '@/lib/session'

export default async function CustomerDashboardPage() {
  const user = await requireRole('customer')
  const stats = await getDashboardStats('customer', user.id)
  return <RoleDashboard role="customer" name={user.name} stats={stats} />
}
