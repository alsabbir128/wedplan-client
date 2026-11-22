import { redirect } from 'next/navigation'
import { requireSignedInUser } from '@/lib/session'

export default async function DashboardPage() {
  const user = await requireSignedInUser()
  if (user.role === 'customer' || user.role === 'vendor' || user.role === 'admin') {
    redirect(`/dashboard/${user.role}`)
  }
  redirect('/sign-in')
}
