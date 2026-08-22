import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  CreditCard,
  Activity,
  Zap,
  Fingerprint,
  Check,
} from 'lucide-react'
import TokenCardStack from '../components/TokenCardStack'

export default function Hero() {
  return (
    <div className="bg-light-band min-h-screen">
      {/* Announcement strip */}
      <div className="bg-night-flat">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2.5 text-[13px] text-slate-400">
          <span>Perimeter is now SOC 2 Type II certified.</span>
          <a
            href="#stats"
            className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
          >
            Read the report
          </a>
        </div>
      </div>

      {/* Liquid-glass nav — floats over every band, so it stays dark-tinted
          and its label colours never have to change. */}
      <header className="sticky top-3 z-40 px-4 sm:top-4">
        <div className="liquid-glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-2.5 pl-5 pr-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.08]">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
            </div>
            <span className="headline text-base text-white">Perimeter</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#product" className="transition-colors hover:text-white">Product</a>
            <a href="#stats" className="transition-colors hover:text-white">Security</a>
            <a href="#features" className="transition-colors hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden px-3 text-sm text-slate-300 transition-colors hover:text-white sm:block"
            >
              Sign in
            </Link>
            <Link to="/login" className="btn btn-light py-2">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* ================= BAND 1 — dark hero ================= */}
      <section className="bg-night-flat relative -mt-[4.25rem] overflow-hidden pt-[4.25rem] text-white">
        <div className="tint-teal pointer-events-none absolute inset-0" />
        <div className="bg-hairline pointer-events-none absolute inset-0 opacity-[0.04]" />

        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-20">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
            {/* Left — content */}
            <div className="animate-rise text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-[13px] text-slate-300 backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-300" />
                </span>
                Payment-grade isolation, by design
              </div>

              <h1 className="headline text-balance text-5xl text-white sm:text-6xl lg:text-[4.25rem]">
                Isolate every payment token.{' '}
                <span className="accent text-teal-200">Contain breaches</span> before
                they spread.
              </h1>

              <p className="mx-auto mt-7 max-w-lg text-balance leading-relaxed text-slate-400 lg:mx-0 lg:text-lg">
                Perimeter gives you a live map of token exposure, automatic breach
                containment, and an immutable audit ledger — all in one dashboard.
              </p>

              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link to="/login" className="btn btn-light">
                  Start your trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn btn-glass">
                  Sign in to dashboard
                </Link>
              </div>
              <p className="mt-5 text-[13px] text-slate-500">
                14-day free trial · No card data ever stored · Cancel anytime
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-slate-500 lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-teal-300" /> SOC 2 Type II
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-teal-300" /> PCI-DSS Level 1
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-teal-300" /> ISO 27001
                </span>
              </div>
            </div>

            {/* Right — stacked glass payment cards */}
            <div className="relative">
              <TokenCardStack />

              <div className="glass-panel animate-float-slow absolute -left-2 bottom-2 hidden w-48 p-4 text-left sm:block">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal/25 bg-teal/10">
                    <Lock className="h-4 w-4 text-teal-300" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Token frozen</div>
                    <div className="font-mono text-sm text-white">0.4s</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[92%] rounded-full bg-teal-400" />
                </div>
              </div>

              <div className="glass-panel absolute -right-2 top-0 hidden w-44 p-4 text-left sm:block">
                <div className="text-[11px] text-slate-500">Blast radius</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="headline text-3xl text-white">1</span>
                  <span className="text-xs text-teal-300">merchant only</span>
                </div>
                <div className="mt-2.5 flex gap-1">
                  {[1, 0, 0, 0, 0].map((v, i) => (
                    <div
                      key={i}
                      className={`h-6 flex-1 rounded ${v ? 'bg-teal-400' : 'bg-white/[0.07]'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* seam into the light band */}
        <div className="seam-to-light h-24" />
      </section>

      {/* ================= BAND 2 — light product ================= */}
      <section id="product" className="bg-light-band relative overflow-hidden">
        <div className="tint-teal-light pointer-events-none absolute inset-0" />
        <div className="bg-hairline-dark pointer-events-none absolute inset-0 opacity-[0.025]" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-24">
          <div className="mb-12 text-center">
            <div className="eyebrow mb-4 text-teal-700">Live isolation map</div>
            <h2 className="headline text-balance text-4xl text-ink sm:text-5xl">
              Every token, its scope, and its{' '}
              <span className="accent text-teal-700">blast radius</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-balance leading-relaxed text-slate-500">
              One surface for exposure, containment, and audit — no switching
              between four consoles to answer one question.
            </p>
          </div>

          {/* the dark app panel reads as a device sitting on the light band */}
          <div className="bg-night-flat overflow-hidden rounded-2xl border border-slate-900/10 shadow-pop">
            <div className="flex items-center gap-2 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-teal/50" />
              <div className="ml-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[11px] text-slate-500">
                <Lock className="h-3 w-3" /> app.perimeter.io/isolation-map
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-5 text-left sm:p-6">
              {[
                { label: 'Active tokens', value: '2,481', sub: '+12% this week', icon: CreditCard },
                { label: 'Contained', value: '17', sub: 'auto-frozen', icon: ShieldCheck },
                { label: 'Ledger entries', value: '48.2k', sub: 'tamper-evident', icon: Activity },
              ].map((s) => (
                <div key={s.label} className="glass-subtle p-4">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                    <s.icon className="h-4 w-4 text-teal-300" />
                  </div>
                  <div className="headline text-2xl text-white">{s.value}</div>
                  <div className="mt-1 text-[11px] text-slate-500">{s.label}</div>
                  <div className="mt-0.5 text-[11px] text-teal-300">{s.sub}</div>
                </div>
              ))}

              <div className="glass-subtle col-span-3 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-white">Token Isolation Map</div>
                  <div className="badge border border-teal/25 bg-teal/10 text-teal-300">Live</div>
                </div>
                <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const state = i === 14 ? 'danger' : i % 7 === 0 ? 'warn' : 'ok'
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-md ${
                          state === 'danger'
                            ? 'bg-red-500 ring-2 ring-red-500/30'
                            : state === 'warn'
                            ? 'bg-teal/45'
                            : 'bg-white/[0.06]'
                        }`}
                      />
                    )
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-white/[0.06]" /> Isolated
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-teal/45" /> Elevated
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-red-500" /> Contained breach
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BAND 3 — dark stats ================= */}
      <section id="stats" className="bg-night-flat relative overflow-hidden text-white">
        <div className="bg-hairline pointer-events-none absolute inset-0 opacity-[0.04]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20">
          <div className="glass-panel grid grid-cols-2 gap-8 p-10 sm:grid-cols-4">
            {[
              { value: '0.4s', label: 'Avg. containment' },
              { value: '99.99%', label: 'Uptime SLA' },
              { value: '2.4M+', label: 'Tokens isolated' },
              { value: '100%', label: 'Audit coverage' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="headline text-4xl text-white sm:text-5xl">{s.value}</div>
                <div className="mt-2 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="seam-to-light h-20" />
      </section>

      {/* ================= BAND 4 — light features ================= */}
      <section id="features" className="bg-light-band relative overflow-hidden">
        <div className="tint-teal-light pointer-events-none absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-24">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="eyebrow mb-4 text-teal-700">The platform</div>
            <h2 className="headline text-balance text-4xl text-ink sm:text-5xl">
              Everything you need to{' '}
              <span className="accent text-teal-700">contain a breach</span>
            </h2>
            <p className="mt-5 text-balance leading-relaxed text-slate-500">
              Purpose-built primitives for teams that treat payment tokens as
              radioactive material.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
              {
                icon: Zap,
                title: 'Real-time Alerts',
                desc: 'Anomaly detection pages your team the moment exposure spikes.',
              },
              {
                icon: Fingerprint,
                title: 'Scoped Access',
                desc: 'Fine-grained roles keep tokens visible only to who needs them.',
              },
              {
                icon: Lock,
                title: 'Zero Card Storage',
                desc: 'We never persist raw card data — only isolated, revocable tokens.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group glass-panel-light p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 transition-colors group-hover:bg-teal group-hover:border-teal">
                  <f.icon className="h-5 w-5 text-teal-700 transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-[15px] text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="seam-to-dark h-20" />
      </section>

      {/* ================= BAND 5 — dark CTA + footer ================= */}
      <section className="bg-night-flat relative overflow-hidden text-white">
        <div className="tint-teal pointer-events-none absolute inset-0" />
        <div className="bg-hairline pointer-events-none absolute inset-0 opacity-[0.04]" />

        <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-24">
          <div className="glass-panel-strong relative overflow-hidden px-8 py-16 text-center">
            <h2 className="headline text-balance text-4xl text-white sm:text-5xl">
              Ready to draw <span className="accent text-teal-200">your perimeter?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-slate-400">
              Spin up token isolation in minutes. No card data ever touches your servers.
            </p>
            <div className="mt-9 flex justify-center">
              <Link to="/login" className="btn btn-light">
                Start your trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <footer className="relative border-t border-white/[0.06]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              <span className="headline text-base text-white">Perimeter</span>
              <span className="text-slate-600">© 2026</span>
            </div>
            <div className="flex items-center gap-7">
              <a href="#" className="transition-colors hover:text-white">Privacy</a>
              <a href="#" className="transition-colors hover:text-white">Security</a>
              <a href="#" className="transition-colors hover:text-white">Status</a>
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}
