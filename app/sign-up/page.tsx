import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Create an account | WedPlan',
  description: 'Create a WedPlan account and start finding your wedding vendors.',
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
