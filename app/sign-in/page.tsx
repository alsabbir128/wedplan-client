import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { auth, isGoogleAuthEnabled } from '@/lib/auth'

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ blocked?: string }> }) {
  const [session, query] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ])
  const user = session?.user as { isBlocked?: boolean } | undefined
  if (user && !user.isBlocked) redirect('/dashboard')

  return (
    <AuthForm
      mode="sign-in"
      googleEnabled={isGoogleAuthEnabled}
      notice={query.blocked === '1' ? 'This account is currently blocked. Contact WedPlan support for help.' : undefined}
    />
  )
}
