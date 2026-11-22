import { AdminManagement } from '@/components/admin-management'
import { requireRole } from '@/lib/session'

export default async function AdminTransactionsPage() {
  await requireRole('admin')
  return <AdminManagement section="transactions" />
}
