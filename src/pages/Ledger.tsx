import { useEffect, useState } from 'react'
import { merchants as mockMerchants, cards, type Merchant } from '../data/mock'
import { StatusBadge, RiskBadge, MerchantLogo } from '../components/Badges'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
import { useModals } from '../state/modals'
import { vaultApi, type LedgerMerchant } from '../api/vaultApi'

type FilterKey = 'all' | 'high' | 'recurring'

function relativeTime(isoString: string | null): string {
  if (!isoString) return 'Never'
  try {
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.round(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.round(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.round(hrs / 24)}d ago`
  } catch {
    return 'Recently'
  }
}

function mapApiMerchantToUi(m: LedgerMerchant, idx: number): Merchant {
  return {
    id: m.id,
    cardId: cards[idx % cards.length].id,
    name: m.name,
    domain: m.domain,
    logoColor: m.logo_color || '#0D9488',
    initials: m.initials || (m.name.slice(0, 2) || '??').toUpperCase(),
    maskedToken: m.masked_token,
    status: m.status === 'active' ? 'Active' : m.status === 'paused' ? 'Paused' : 'Revoked',
    risk: m.risk === 'High' ? 'High' : m.risk === 'Medium' ? 'Medium' : 'Low',
    recurring: m.recurring,
    monthlyLimit: m.monthly_limit,
    spent: m.spent,
    lastUsed: relativeTime(m.last_used_at),
  }
}

export default function Ledger() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [query, setQuery] = useState('')
  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants)
  const [loading, setLoading] = useState(false)
  const [usingLiveApi, setUsingLiveApi] = useState(false)
  const openNewToken = useModals((s) => s.openNewToken)

  const fetchLedger = async () => {
    setLoading(true)
    try {
      const data = await vaultApi.getLedger()
      if (data && Array.isArray(data.merchants)) {
        const mapped = data.merchants.map((m, idx) => mapApiMerchantToUi(m, idx))
        setMerchants(mapped)
        setUsingLiveApi(true)
      }
    } catch (err) {
      console.warn('Vault API /ledger unavailable, using fallback mock data:', err)
      setUsingLiveApi(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLedger()
    const handleUpdate = () => fetchLedger()
    window.addEventListener('perimeter:data-updated', handleUpdate)
    return () => window.removeEventListener('perimeter:data-updated', handleUpdate)
  }, [])

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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">Exposure Ledger</h1>
            {usingLiveApi ? (
              <span className="badge bg-emerald-50 text-emerald-700 py-0.5 text-[11px]">Live Vault API</span>
            ) : (
              <span className="badge bg-slate-100 text-slate-600 py-0.5 text-[11px]">Mock Fallback</span>
            )}
          </div>
          <p className="text-sm text-slate-400">Every isolated token, its status, and its limits.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLedger}
            title="Refresh Ledger"
            className="btn btn-ghost px-3 py-2 text-slate-500"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="btn btn-primary" onClick={openNewToken}>
            <Plus className="h-4 w-4" />
            New Token
          </button>
        </div>
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
                          className={`h-full rounded-full ${(m.monthlyLimit > 0 && m.spent / m.monthlyLimit > 0.8) ? 'bg-amber-500' : 'bg-teal'}`}
                          style={{ width: `${m.monthlyLimit > 0 ? Math.min(100, (m.spent / m.monthlyLimit) * 100) : 0}%` }}
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
