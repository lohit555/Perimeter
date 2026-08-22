import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowRight, Lock, CreditCard, Activity } from 'lucide-react'

export default function Hero() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10">
            <ShieldCheck className="h-5 w-5 text-teal" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-ink">Perimeter</div>
            <div className="text-[11px] font-medium text-slate-400">Token Isolation</div>
          </div>
        </div>
        <Link to="/login" className="btn btn-ghost">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <Lock className="h-3.5 w-3.5" />
          Payment-grade isolation, by design
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Isolate every payment token.{' '}
          <span className="text-teal">Contain breaches before they spread.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-slate-500">
          Perimeter gives you a live map of token exposure, automatic breach
          containment, and an immutable audit ledger — all in one dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login" className="btn btn-primary">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/" className="btn btn-ghost">
            View dashboard
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            icon: CreditCard,
            title: 'Token Isolation Map',
            desc: 'See every token, its merchant scope, and its blast radius at a glance.',
          },
          {
            icon: ShieldCheck,
            title: 'Breach Containment',
            desc: 'One-click emergency lock freezes compromised tokens instantly.',
          },
          {
            icon: Activity,
            title: 'Immutable Ledger',
            desc: 'Every action is recorded in a tamper-evident audit trail.',
          },
        ].map((f) => (
          <div key={f.title} className="card p-6 text-left">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10">
              <f.icon className="h-5 w-5 text-teal" />
            </div>
            <h3 className="text-sm font-bold text-ink">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
