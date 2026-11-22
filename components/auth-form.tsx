'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type AuthFormProps = { mode: 'sign-in' | 'sign-up'; googleEnabled: boolean; notice?: string }
type AccountRole = 'customer' | 'vendor'

export function AuthForm({ mode, googleEnabled, notice }: AuthFormProps) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'
  const [pending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [role, setRole] = useState<AccountRole>('customer')
  const [password, setPassword] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const submittedPassword = String(formData.get('password') ?? '')

    if (isSignUp && !/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(submittedPassword)) {
      setErrorMessage('Use at least 6 characters, including one uppercase and one lowercase letter.')
      return
    }

    const name = String(formData.get('name') ?? '').trim()
    const businessName = String(formData.get('businessName') ?? '').trim()
    if (isSignUp && role === 'vendor' && !businessName) {
      setErrorMessage('Add your business name to continue as a vendor.')
      return
    }

    setPending(true)
    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name,
            email,
            password: submittedPassword,
            role,
            ...(role === 'vendor' ? { businessName } : {}),
            callbackURL: '/dashboard',
          } as Parameters<typeof authClient.signUp.email>[0])
        : await authClient.signIn.email({ email, password: submittedPassword, callbackURL: '/dashboard' })

      if (result.error) {
        setErrorMessage(isSignUp ? 'We couldn’t create your account. Check your details and try again.' : 'We couldn’t sign you in. Check your email and password.')
        return
      }
      router.replace('/dashboard')
      router.refresh()
    } catch {
      setErrorMessage(isSignUp ? 'We couldn’t create your account. Please try again.' : 'We couldn’t sign you in. Check your email and password.')
    } finally {
      setPending(false)
    }
  }

  async function continueWithGoogle() {
    if (!googleEnabled || pending) return
    setPending(true)
    setErrorMessage('')
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })
      if (result.error) setErrorMessage('Google sign-in is unavailable right now. Please try email and password.')
    } catch {
      setErrorMessage('Google sign-in is unavailable right now. Please try email and password.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-page">
      <aside className="auth-visual" aria-label="Wedding planning with WedPlan">
        <Image src="/wedplan-hero.png" alt="A softly lit wedding ceremony in a garden" fill priority sizes="(max-width: 760px) 100vw, 50vw" className="auth-visual-image" />
        <div className="auth-visual-shade" />
        <Link href="/" className="auth-visual-brand"><Heart size={17} fill="currentColor" /> wedplan<span>.</span></Link>
        <div className="auth-visual-copy">
          <span className="auth-kicker"><ShieldCheck size={14} /> MADE FOR YOUR KIND OF LOVE</span>
          <h1>{isSignUp ? <>A little more<br />room for <em>your story.</em></> : <>Your people are<br />right where you <em>left them.</em></>}</h1>
          <p>Good planning starts with the people who make your day feel like you.</p>
        </div>
        <span className="auth-visual-caption">THOUGHTFULLY FOUND · BEAUTIFULLY YOU</span>
      </aside>

      <section className="auth-panel">
        <Link href="/" className="auth-mobile-brand"><Heart size={17} fill="currentColor" /> wedplan<span>.</span></Link>
        <div className="auth-card">
          <span className="eyebrow">{isSignUp ? 'YOUR NEXT CHAPTER' : 'WELCOME BACK'}</span>
          <h2>{isSignUp ? 'Let’s make it yours.' : 'Lovely to see you.'}</h2>
          <p className="auth-description">{isSignUp ? 'Create your account and start planning with your people.' : 'Sign in to pick up where your plans left off.'}</p>

          <form className="auth-form" onSubmit={submit} noValidate>
            <FieldGroup>
              {isSignUp && (
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input id="name" name="name" autoComplete="name" placeholder="Your name" required maxLength={100} />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder={isSignUp ? 'At least 6 characters' : 'Your password'} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
                {isSignUp && <FieldDescription>Use at least 6 characters, with uppercase and lowercase letters.</FieldDescription>}
              </Field>
              {isSignUp && (
                <>
                  <Field>
                    <FieldLabel htmlFor="role">I’m here as</FieldLabel>
                    <select id="role" name="role" className="auth-select" value={role} onChange={(event) => setRole(event.target.value as AccountRole)}>
                      <option value="customer">A couple planning a wedding</option>
                      <option value="vendor">A wedding service provider</option>
                    </select>
                  </Field>
                  {role === 'vendor' && (
                    <Field>
                      <FieldLabel htmlFor="businessName">Business name</FieldLabel>
                      <Input id="businessName" name="businessName" autoComplete="organization" placeholder="Your business name" required maxLength={120} />
                    </Field>
                  )}
                </>
              )}
            </FieldGroup>

            {notice && <p className="auth-provider-note" role="status">{notice}</p>}
            {errorMessage && <FieldError className="auth-error" role="alert">{errorMessage}</FieldError>}
            <Button type="submit" size="lg" className="auth-submit" disabled={pending}>
              {pending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              {!pending && <ArrowRight data-icon="inline-end" />}
            </Button>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <Button type="button" variant="outline" size="lg" className="auth-google" disabled={!googleEnabled || pending} onClick={continueWithGoogle}>
            <span className="google-mark" aria-hidden="true">G</span>
            Continue with Google
          </Button>
          {!googleEnabled && <p className="auth-provider-note">Google sign-in will be available after its OAuth credentials are configured.</p>}
          <p className="auth-switch">
            {isSignUp ? 'Already have an account?' : 'New to WedPlan?'}{' '}
            <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </div>
        <p className="auth-privacy">Your plans and account details stay private.</p>
      </section>
    </main>
  )
}
