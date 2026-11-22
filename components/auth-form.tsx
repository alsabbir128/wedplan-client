'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = { mode: 'sign-in' | 'sign-up'; redirectTo?: string }

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password })

      if (result.error) {
        setError(isSignUp
          ? 'We could not create your account. Check your details and try again.'
          : 'We could not sign you in. Check your email and password and try again.')
        return
      }

      const account = result.data?.user as unknown as { role?: string; isBlocked?: boolean } | undefined
      if (account?.isBlocked) {
        await authClient.signOut()
        setError('This account is currently unavailable. Contact WedPlan support for help.')
        return
      }
      const role = account?.role
      const destination = role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : redirectTo === '/vendor/apply' ? '/vendor/apply' : '/customer'
      router.replace(destination)
      router.refresh()
    } catch {
      setError('We could not complete that request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <Link href="/" className="wordmark auth-wordmark" aria-label="WedPlan home">wedplan<span className="brand-period">.</span></Link>
      <section className="auth-card" aria-labelledby="auth-title">
        <span className="eyebrow">A LOVELY PLACE TO BEGIN</span>
        <h1 id="auth-title">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p>{isSignUp ? 'Start planning with people who make your day yours.' : 'Sign in to pick up where your planning left off.'}</p>
        <form onSubmit={handleSubmit} className="stacked-form">
          {isSignUp && (
            <label className="form-field">
              <span>Your name</span>
              <input autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          )}
          <label className="form-field">
            <span>Email address</span>
            <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {isSignUp ? 'Already have an account?' : 'New to WedPlan?'}{' '}
          <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link>
        </p>
        {isSignUp && <p className="auth-note">Every new account starts as a customer. Vendor access is granted only after an application is approved.</p>}
      </section>
    </main>
  )
}
