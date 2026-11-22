import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { auth, isGoogleAuthEnabled } from '@/lib/auth'

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as { isBlocked?: boolean } | undefined
  if (user && !user.isBlocked) redirect('/dashboard')

  return <AuthForm mode="sign-up" googleEnabled={isGoogleAuthEnabled} />
}
