import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Create an account | WedPlan',
  description: 'Create a WedPlan customer account or apply to join as a wedding vendor.',
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
