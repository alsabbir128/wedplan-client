import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Sign in | WedPlan',
  description: 'Sign in to your WedPlan account to manage your wedding planning.',
}

type SignInPageProps = { searchParams: Promise<{ next?: string }> }

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const redirectTo = params.next === '/vendor/apply' ? params.next : undefined
  return <AuthForm mode="sign-in" redirectTo={redirectTo} />
}
