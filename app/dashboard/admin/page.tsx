import { RoleDashboard } from '@/components/role-dashboard'
import { getDashboardStats } from '@/lib/dashboard-data'
import { requireRole } from '@/lib/session'

export default async function AdminDashboardPage() {
  const user = await requireRole('admin')
  const stats = await getDashboardStats('admin', user.id)
  return <RoleDashboard role="admin" name={user.name} stats={stats} />
}
