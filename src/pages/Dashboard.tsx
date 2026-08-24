import { useEffect, useState } from 'react'
import { Info, Lock, Plus, RefreshCw } from 'lucide-react'
import TokenIsolationMap from '../components/TokenIsolationMap'
import RecentTransactions from '../components/RecentTransactions'
import { merchants as mockMerchants, transactions as mockTransactions, cards, type Merchant, type Transaction } from '../data/mock'
import { useExtensionTokens } from '../state/extensionTokens'
import { useModals } from '../state/modals'
import { useAuth } from '../state/auth'
import { vaultApi, type LedgerMerchant, type LedgerActivityEvent } from '../api/vaultApi'

function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

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

function mapApiActivityToTransaction(a: LedgerActivityEvent): Transaction {
  const isBlocked = a.type === 'blocked'
  const isRotated = a.type === 'rotation' || a.type === 'revoked'
  const state = isBlocked ? 'Flagged' : isRotated ? 'Auto-rotated' : 'Clear'
  
  // Extract amount if present in detail string e.g. "$89.99"
  const amountMatch = a.detail.match(/\$(\d+(?:\.\d+)?)/)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 15.99

  return {
    id: a.id,
    merchant: a.merchant,
    domain: `${a.merchant.toLowerCase().replace(/\s+/g, '')}.com`,
    initials: (a.merchant.slice(0, 2) || '??').toUpperCase(),
    logoColor: isBlocked ? '#E11D48' : isRotated ? '#7C3AED' : '#0D9488',
    maskedToken: '•••• ****',
    amount,
    state,
    time: relativeTime(a.time),
  }
}

export default function Dashboard() {
  const openNewToken = useModals((s) => s.openNewToken)
  const { profile } = useAuth()
  const extensionTokens = useExtensionTokens()
  const extensionActive = extensionTokens.filter((t) => t.status === 'active').length

  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [loading, setLoading] = useState(false)
  const [usingLiveApi, setUsingLiveApi] = useState(false)

  const fetchLedgerData = async () => {
    setLoading(true)
    try {
      const data = await vaultApi.getLedger()
      if (data && Array.isArray(data.merchants)) {
        const mappedMerchants = data.merchants.map((m, idx) => mapApiMerchantToUi(m, idx))
        setMerchants(mappedMerchants)

        if (Array.isArray(data.activity) && data.activity.length > 0) {
          const mappedTxns = data.activity.map(mapApiActivityToTransaction)
          setTransactions(mappedTxns)
        }
        setUsingLiveApi(true)
      }
    } catch (err) {
      console.warn('Vault API unavailable, falling back to mock data:', err)
      setUsingLiveApi(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLedgerData()
    const handleUpdate = () => fetchLedgerData()
    window.addEventListener('perimeter:data-updated', handleUpdate)
    return () => window.removeEventListener('perimeter:data-updated', handleUpdate)
  }, [])

  const activeTokenCount = merchants.filter((m) => m.status === 'Active').length + extensionActive
  const flaggedCount = transactions.filter((t) => t.state === 'Flagged').length
  const autoRotateCount = transactions.filter((t) => t.state === 'Auto-rotated').length

  const stats = [
    {
      label: 'Active tokens',
      value: String(activeTokenCount),
      hint: 'Tokens currently able to be charged, including any issued from the browser extension.',
    },
    {
      label: 'Flagged charges',
      value: String(flaggedCount),
      hint: 'Charges from outside your trusted sites.',
    },
    {
      label: 'Auto-rotations',
      value: String(autoRotateCount),
      hint: 'Tokens replaced after a reported breach.',
    },
    {
      label: 'Exposure this month',
      value: '$0.00',
      hint: 'Unauthorized spend that reached your funding card.',
    },
  ]

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      {/* greeting */}
      <div className="mb-9 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="bg-night-flat flex h-16 w-16 items-center justify-center rounded-2xl">
            <Lock className="h-7 w-7 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[15px] text-graphite-soft">
              <span>{longDate.format(new Date())}</span>
              {usingLiveApi ? (
                <span className="badge bg-emerald-50 text-emerald-700 py-0.5 text-[11px]">Live Vault API</span>
              ) : (
                <span className="badge bg-slate-100 text-slate-600 py-0.5 text-[11px]">Mock Fallback</span>
              )}
            </div>
            <h1 className="t-display mt-1.5 text-[44px] text-graphite">
              {greeting()}, {profile?.name ?? 'there'}
            </h1>
            <p className="mt-2 text-[15px] text-graphite-soft">
              Every site gets its own token. Nothing else can reach your card.
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[14px] text-graphite-soft">
            {extensionActive > 0
              ? `${extensionActive} issued from your browser`
              : `${merchants.length} sites tokenized`}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={fetchLedgerData}
              title="Refresh Live Data"
              className="chip border-line px-3 py-2 text-graphite hover:border-slate-300"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>
            <button
              onClick={openNewToken}
              className="chip border-accent bg-accent px-4 py-2.5 text-[14px] text-white hover:border-accent-deep hover:bg-accent-deep hover:text-white"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              New token
            </button>
          </div>
        </div>
      </div>

      {/* stat strip — one card, hairline-divided */}
      <div className="card mb-7 grid grid-cols-2 divide-line-soft sm:grid-cols-4 sm:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-8 py-7">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] text-graphite-soft">{s.label}</span>
              <span title={s.hint} className="cursor-help">
                <Info className="h-4 w-4 text-graphite-faint" strokeWidth={1.75} />
              </span>
            </div>
            <div className="t-num t-display mt-3 text-[46px] text-graphite">{s.value}</div>
          </div>
        ))}
      </div>

      {/* activity + isolation map */}
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentTransactions transactions={transactions} />
        </div>
        <div className="lg:col-span-2">
          <TokenIsolationMap merchants={merchants} />
        </div>
      </div>
    </div>
  )
}
