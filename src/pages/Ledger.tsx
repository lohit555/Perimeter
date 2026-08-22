import { useState } from 'react'
import { merchants } from '../data/mock'
import { StatusBadge, RiskBadge, MerchantLogo } from '../components/Badges'
import { Plus, Search, Filter } from 'lucide-react'
import { useModals } from '../state/modals'

type FilterKey = 'all' | 'high' | 'recurring'

export default function Ledger() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [query, setQuery] = useState('')
  const openNewToken = useModals((s) => s.openNewToken)

  const rows = merchants.filter((m) => {
    if (filter === 'high' && m.risk !== 'High') return false
    if (filter === 'recurring' && !m.recurring) return false
    if (query && !m.name.toLowerCase().includes(query.toLowerCase()) && !m.domain.includes(query)) return false
    return true
  })

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Tokens' },
    { key: 'high', label: 'High Risk' },
    { key: 'recurring', label: 'Recurring' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Exposure Ledger</h1>
          <p className="text-sm text-slate-400">Every isolated token, its status, and its limits.</p>
        </div>
        <button className="btn btn-primary" onClick={openNewToken}>
          <Plus className="h-4 w-4" />
          New Token
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search merchant or domain…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
            <Filter className="ml-1.5 h-4 w-4 text-slate-400" />
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key ? 'bg-teal text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="scroll-area overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Merchant</th>
                <th className="px-5 py-3">Token</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Risk</th>
                <th className="px-5 py-3">Spending</th>
                <th className="px-5 py-3">Last used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((m) => (
                <tr key={m.id} className="text-sm hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <MerchantLogo initials={m.initials} color={m.logoColor} size="sm" />
                      <div>
                        <div className="font-medium text-ink">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.domain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{m.maskedToken}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                  <td className="px-5 py-3.5"><RiskBadge risk={m.risk} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${m.spent / m.monthlyLimit > 0.8 ? 'bg-amber-500' : 'bg-teal'}`}
                          style={{ width: `${Math.min(100, (m.spent / m.monthlyLimit) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">${m.spent}/${m.monthlyLimit}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{m.lastUsed}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    No tokens match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
