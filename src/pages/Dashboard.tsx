import { Info, Lock, Plus } from 'lucide-react'
import TokenIsolationMap from '../components/TokenIsolationMap'
import RecentTransactions from '../components/RecentTransactions'
import { merchants, transactions } from '../data/mock'
import { useModals } from '../state/modals'

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

const stats = [
  {
    label: 'Active tokens',
    value: String(merchants.filter((m) => m.status === 'Active').length),
    hint: 'Tokens currently able to be charged.',
  },
  {
    label: 'Flagged charges',
    value: String(transactions.filter((t) => t.state === 'Flagged').length),
    hint: 'Charges from outside your trusted sites.',
  },
  {
    label: 'Auto-rotations',
    value: String(transactions.filter((t) => t.state === 'Auto-rotated').length),
    hint: 'Tokens replaced after a reported breach.',
  },
  {
    label: 'Exposure this month',
    value: '$0.00',
    hint: 'Unauthorized spend that reached your funding card.',
  },
]

export default function Dashboard() {
  const openNewToken = useModals((s) => s.openNewToken)

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      {/* greeting */}
      <div className="mb-9 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="bg-night-flat flex h-16 w-16 items-center justify-center rounded-2xl">
            <Lock className="h-7 w-7 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[15px] text-graphite-soft">
              {longDate.format(new Date())}
            </div>
            <h1 className="t-display mt-1.5 text-[44px] text-graphite">
              {greeting()}, Aaryan
            </h1>
            <p className="mt-2 text-[15px] text-graphite-soft">
              Every site gets its own token. Nothing else can reach your card.
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[14px] text-graphite-soft">6 of 7 sites tokenized</div>
          <button
            onClick={openNewToken}
            className="chip mt-3 border-accent bg-accent px-4 py-2.5 text-[14px] text-white hover:border-accent-deep hover:bg-accent-deep hover:text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New token
          </button>
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
          <RecentTransactions />
        </div>
        <div className="lg:col-span-2">
          <TokenIsolationMap />
        </div>
      </div>
    </div>
  )
}
