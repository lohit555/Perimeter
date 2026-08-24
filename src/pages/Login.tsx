import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, ArrowRight, Check, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import TokenCardStack from '../components/TokenCardStack'
import { supabase, toAuthEmail } from '../lib/supabase'
import { useAuth } from '../state/auth'

type Mode = 'signin' | 'signup'

function friendlyError(err: { message?: string } | null): string {
  const m = (err?.message || '').toLowerCase()
  if (m.includes('invalid login credentials')) return 'Wrong username or password.'
  if (m.includes('already registered')) return 'That username is already taken. Try another one.'
  if (m.includes('at least 6 characters')) return 'Password must be at least 6 characters.'
  return err?.message || 'Something went wrong. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const { session, configured } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in? Straight to the dashboard.
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true })
  }, [session, navigate])

  const switchMode = (m: Mode) => {
    setMode(m)
    setError('')
    setPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!supabase) {
      setError("Authentication is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env and restart the dev server.")
      return
    }

    const email = toAuthEmail(username)
    if (!email || email === '@perimeter.dev') {
      setError('Please enter a valid username (letters, numbers, . _ -).')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(friendlyError(error))
          return
        }
        navigate('/dashboard')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim().toLowerCase(), name: name.trim() } },
        })
        if (error) {
          setError(friendlyError(error))
          return
        }
        if (data.session) {
          navigate('/dashboard')
        } else {
          setError('Account created. Check your email to confirm before signing in.')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-2">
      {/* Left — branded 3D panel */}
      <div className="bg-night-flat tint-teal relative hidden overflow-hidden lg:block">
        {/* glows */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
        {/* subtle grid */}
        <div className="bg-hairline pointer-events-none absolute inset-0 opacity-[0.05]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          {/* brand */}
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07] backdrop-blur">
              <ShieldCheck className="h-[18px] w-[18px] text-teal-300" />
            </div>
            <div className="leading-tight">
              <div className="headline text-lg text-white">Perimeter</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Token Isolation
              </div>
            </div>
          </Link>

          {/* 3D stacked glass payment cards */}
          <div className="flex flex-1 items-center justify-center py-10">
            <TokenCardStack tilt="rotateX(12deg) rotateY(-16deg)" />
          </div>

          {/* value props */}
          <div className="space-y-3">
            <p className="headline max-w-sm text-3xl text-white">
              Contain breaches{' '}
              <span className="accent text-teal-200">before they spread.</span>
            </p>
            <ul className="space-y-2">
              {['Freeze compromised tokens in 0.4s', 'Immutable, tamper-evident audit ledger', 'No raw card data ever stored'].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal/20">
                    <Check className="h-3 w-3 text-teal-100" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
        <div className="w-full max-w-sm">
          {/* mobile brand */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="headline text-xl text-ink">Perimeter</span>
          </Link>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="headline text-4xl text-ink">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {mode === 'signin'
                ? 'Sign in with your Perimeter username'
                : 'Every merchant gets its own token. So does every user.'}
            </p>
          </div>

          {!configured && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              Authentication is not configured yet. Add{' '}
              <code className="font-mono text-[12px]">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono text-[12px]">VITE_SUPABASE_ANON_KEY</code> to your{' '}
              <code className="font-mono text-[12px]">.env</code> file.
            </div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-4 p-6 shadow-pop">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs text-slate-600">Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input pl-9"
                    placeholder="Aaryan"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs text-slate-600">Username</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-9"
                  placeholder={mode === 'signin' ? 'aaryan' : 'Choose a username'}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs text-slate-600">Password</label>
                {mode === 'signin' && (
                  <button type="button" className="text-xs font-medium text-teal hover:text-teal-700">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={busy} className="btn btn-primary w-full">
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="text-center text-sm text-slate-500">
              {mode === 'signin' ? (
                <>
                  New to Perimeter?{' '}
                  <button type="button" onClick={() => switchMode('signup')} className="text-teal hover:text-teal-700">
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('signin')} className="text-teal hover:text-teal-700">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs font-medium text-slate-400 hover:text-slate-600">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
