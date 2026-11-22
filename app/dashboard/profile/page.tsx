import { ProfileSettings } from '@/components/profile-settings'
import { requireSignedInUser } from '@/lib/session'

export default async function ProfilePage() {
  const user = await requireSignedInUser()
  return <ProfileSettings user={user as { name: string; email: string; role: string; businessName?: string; image?: string | null }} />
}
