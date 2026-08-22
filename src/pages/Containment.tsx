import { containmentSteps, protectedMerchants } from '../data/mock'
import { ShieldCheck, ShieldAlert, CheckCircle2, Circle } from 'lucide-react'
import { MerchantLogo } from '../components/Badges'

const palette = ['#E11D48', '#FF9900', '#0F172A', '#1DB954', '#2563EB']

export default function Containment() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Breach Containment</h1>
        <p className="text-sm text-slate-400">Isolate, revoke, and replace — without touching other merchants.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Incident + timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="flex items-start gap-4 border-b border-red-100 bg-red-50/60 px-6 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-ink">Incident: ShadyDeals data exposure</h2>
                  <span className="badge bg-red-100 text-red-700">Active</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Detected Aug 22, 09:14. The exposed token was isolated to ShadyDeals only — no other
                  merchant is affected.
                </p>
              </div>
            </div>

            <div className="px-6 py-6">
              <h3 className="mb-5 text-sm font-semibold text-ink">Containment timeline</h3>
              <ol className="space-y-0">
                {containmentSteps.map((step, i) => (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.done ? (
                        <CheckCircle2 className="h-7 w-7 text-teal" />
                      ) : (
                        <Circle className="h-7 w-7 text-slate-300" />
                      )}
                      {i < containmentSteps.length - 1 && (
                        <div className={`my-1 w-px flex-1 ${step.done ? 'bg-teal/40' : 'bg-slate-200'}`} style={{ minHeight: '2.5rem' }} />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className={`text-sm font-semibold ${step.done ? 'text-ink' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                      <div className="text-sm text-slate-500">{step.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Protected side panel */}
        <div className="card p-6">
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal" />
            <h3 className="text-sm font-semibold text-ink">Other merchants: Protected</h3>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            Isolation means this breach cannot spread. These tokens were never shared with ShadyDeals.
          </p>
          <ul className="space-y-3">
            {protectedMerchants.map((name, i) => (
              <li key={name} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                <MerchantLogo initials={name.slice(0, 2).toUpperCase()} color={palette[i % palette.length]} size="sm" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{name}</div>
                  <div className="text-xs text-slate-400">Token untouched</div>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Protected
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
