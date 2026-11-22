import { RoleDashboard } from '@/components/role-dashboard'
import { getDashboardStats } from '@/lib/dashboard-data'
import { requireRole } from '@/lib/session'

export default async function VendorDashboardPage() {
  const user = await requireRole('vendor')
  const stats = await getDashboardStats('vendor', user.id)
  return <RoleDashboard role="vendor" name={user.name} stats={stats} />
}
