import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, Lock, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import TokenCardStack from '../components/TokenCardStack'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
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
            <h1 className="headline text-4xl text-ink">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your Perimeter dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4 p-6 shadow-pop">
            <div>
              <label className="mb-1.5 block text-xs text-slate-600">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs text-slate-600">
                  Password
                </label>
                <button type="button" className="text-xs font-medium text-teal hover:text-teal-700">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button type="button" className="btn btn-ghost w-full">
              <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-teal text-[10px] text-white">S</span>
              Continue with SSO
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <a href="mailto:access@perimeter.example" className="text-teal hover:text-teal-700">
              Request access
            </a>
          </p>

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
