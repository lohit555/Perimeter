import { KeyRound, ShieldCheck, DollarSign } from 'lucide-react'

const metrics = [
  { label: 'Active Tokens', value: '6', sub: 'across 5 merchants', icon: KeyRound, tint: 'text-teal', bg: 'bg-teal-50' },
  { label: 'Protected Breaches', value: '3', sub: 'this month', icon: ShieldCheck, tint: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Unauthorized Loss', value: '$0', sub: 'isolation working', icon: DollarSign, tint: 'text-emerald-600', bg: 'bg-emerald-50' },
]

export default function SecuritySummary() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{m.label}</span>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.bg}`}>
              <m.icon className={`h-4 w-4 ${m.tint}`} />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-ink">{m.value}</div>
          <div className="mt-1 text-xs text-slate-400">{m.sub}</div>
        </div>
      ))}
    </div>
  )
}
