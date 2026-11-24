import { Link } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useI18n } from '#/lib/i18n'
import { getSupabase } from '#/lib/supabase'
import { LogoMark } from './Logo'

export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset'

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2l6.5 5C41.2 35.8 43.6 30.7 43.6 24.5Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.4-4.8l-6.5-5c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.5l-6.7 5.2C9.3 39.4 16.1 44 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2l-6.7-5.2a20.3 20.3 0 0 0 0 17.6l6.7-5.2Z" />
      <path fill="#EA4335" d="M24 10.2c3 0 5.8 1 8 3.2l6-6C34.4 4.1 29.7 2 24 2 16.1 2 9.3 6.6 5.9 13.2l6.7 5.2C14.2 13.8 18.7 10.2 24 10.2Z" />
    </svg>
  )
}

const TITLES: Record<AuthMode, string> = {
  login: 'Welcome back',
  signup: 'Create your PDF Pilot 5U account',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
}

export function AuthForm({
  mode,
  compact = false,
  onSuccess,
}: {
  mode: AuthMode
  compact?: boolean
  onSuccess?: () => void
}) {
  const { tr } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const Title = compact ? 'h2' : 'h1'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const supabase = getSupabase()
      const origin = window.location.origin
      if (mode === 'signup') {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        const { error: authError } = sessionData.session?.user.is_anonymous
          ? await supabase.auth.updateUser(
              { email, password },
              { emailRedirectTo: `${origin}/dashboard` },
            )
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${origin}/dashboard` },
            })
        if (authError) throw authError
        setMessage('Check your email for the verification link to finish creating your account.')
      } else if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
        if (onSuccess) onSuccess()
        else window.location.assign('/dashboard')
      } else if (mode === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` })
        if (authError) throw authError
        setMessage('If an account exists for that email, a password reset link has been sent.')
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password })
        if (authError) throw authError
        setMessage('Your password has been updated. You can now sign in.')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The authentication request failed.')
    } finally {
      setBusy(false)
    }
  }

  const signInWithGoogle = async () => {
    setBusy(true)
    setError('')
    try {
      const supabase = getSupabase()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const options = { redirectTo: `${window.location.origin}/dashboard` }
      const { error: authError } = mode === 'signup' && sessionData.session?.user.is_anonymous
        ? await supabase.auth.linkIdentity({ provider: 'google', options })
        : await supabase.auth.signInWithOAuth({ provider: 'google', options })
      if (authError) throw authError
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google sign-in failed.')
      setBusy(false)
    }
  }

  return (
    <section
      aria-labelledby="auth-title"
      className={`w-full rounded-3xl border border-line bg-card shadow-[0_24px_70px_-35px_rgb(16_24_40/0.35)] ${
        compact ? 'max-w-none p-4' : 'mx-auto max-w-lg p-6 sm:p-9'
      }`}
    >
      <div className={`flex items-center gap-3 ${compact ? 'mb-4' : 'mb-7'}`}>
        <LogoMark className={compact ? 'size-9' : 'size-11'} />
        <div>
          <p className="font-display text-sm font-bold">PDF Pilot 5U</p>
          <p className="mt-0.5 text-xs text-muted">Account access</p>
        </div>
      </div>
      <Title id="auth-title" className={`font-display font-extrabold tracking-tight ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
        {TITLES[mode]}
      </Title>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {mode === 'signup'
          ? 'Create an account for account features. AI tools can also be used as a guest with your consent.'
          : mode === 'login'
            ? 'Sign in for account features. AI tools can be used without a registered account.'
            : mode === 'reset'
              ? 'Your new password must be at least 8 characters.'
              : 'We’ll email you a secure password reset link.'}
      </p>

      {(mode === 'login' || mode === 'signup') && (
        <div className={compact ? 'mt-4' : 'mt-7'}>
          <button
            type="button"
            disabled={busy}
            onClick={signInWithGoogle}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-card px-4 font-semibold text-ink transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <GoogleMark />
            Continue with Google
          </button>
          <div className={`${compact ? 'my-4' : 'my-6'} flex items-center gap-3 text-xs font-medium text-muted`}>
            <span className="h-px flex-1 bg-line" />
            or continue with email
            <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      <form className={compact ? 'space-y-3' : 'space-y-5'} onSubmit={submit}>
        {mode !== 'reset' && (
          <label htmlFor="auth-email" className="block space-y-2 text-sm font-semibold">
            <span>Email address</span>
            <input
              id="auth-email"
              className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 font-normal outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        )}
        {mode !== 'forgot' && (
          <label htmlFor="auth-password" className="block space-y-2 text-sm font-semibold">
            <span>{mode === 'reset' ? 'New password' : 'Password'}</span>
            <span className="relative block">
              <input
                id="auth-password"
                className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 pe-12 font-normal outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'reset' ? 'new-password' : mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={mode === 'signup' || mode === 'reset' ? 'auth-password-hint' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? tr('Hide password', 'پاس ورڈ چھپائیں') : tr('Show password', 'پاس ورڈ دکھائیں')}
                className="absolute inset-y-0 end-2 my-auto grid size-9 place-items-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </span>
            {(mode === 'signup' || mode === 'reset') && (
              <span id="auth-password-hint" className="block text-xs font-normal text-muted">Use at least 8 characters.</span>
            )}
          </label>
        )}
        {error && <p role="alert" className="rounded-xl bg-blush px-3 py-2 text-sm font-medium text-accent-dark">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-line bg-paper px-3 py-2 text-sm">{message}</p>}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-accent px-5 font-semibold text-white transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
          {busy ? tr('Please wait…', 'انتظار کریں…') : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Update password'}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm text-muted">
        {mode === 'login' && <><Link to="/forgot-password" className="hover:text-accent">Forgot password?</Link><Link to="/signup" className="hover:text-accent">Create account</Link></>}
        {mode === 'signup' && <Link to="/login" className="ms-auto hover:text-accent">Already have an account? Sign in</Link>}
        {(mode === 'forgot' || mode === 'reset') && <Link to="/login" className="hover:text-accent">Back to sign in</Link>}
      </div>
    </section>
  )
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-gradient-to-b from-blush/30 to-paper px-5 py-10 sm:py-14">
      <AuthForm mode={mode} />
    </div>
  )
}
