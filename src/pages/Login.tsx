import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, Lock } from 'lucide-react'
import { useState } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
            <ShieldCheck className="h-6 w-6 text-teal" />
          </div>
          <h1 className="text-xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your Perimeter account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
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
              <label className="block text-xs font-semibold text-slate-600">
                Password
              </label>
              <a href="#" className="text-xs font-medium text-teal hover:text-teal-700">
                Forgot?
              </a>
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
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/login" className="font-semibold text-teal hover:text-teal-700">
            Request access
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link to="/hero" className="text-xs font-medium text-slate-400 hover:text-slate-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
