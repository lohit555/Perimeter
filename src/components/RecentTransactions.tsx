import { AlertTriangle, ArrowRight, Check, RotateCw } from 'lucide-react'
import { transactions, type Transaction } from '../data/mock'

const stateStyles: Record<Transaction['state'], string> = {
  Clear: 'bg-emerald-50 text-emerald-800',
  'Auto-rotated': 'bg-accent-soft text-accent-deep',
  Flagged: 'bg-rose-50 text-rose-800',
}

const stateIcon = {
  Clear: Check,
  'Auto-rotated': RotateCw,
  Flagged: AlertTriangle,
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default function RecentTransactions() {
  return (
    <div className="card-flush flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <h2 className="t-title text-[20px] text-graphite">Recent activity</h2>
        <span className="text-[13px] text-graphite-faint">Last 7 days</span>
      </div>

      <div className="flex-1">
        {transactions.map((t) => {
          const Icon = stateIcon[t.state]
          return (
            <div
              key={t.id}
              className="row-rule flex items-center gap-4 px-6 py-4 transition-colors hover:bg-paper-sunken/60"
            >
              <Avatar initials={t.initials} color={t.logoColor} />

              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] text-graphite">{t.merchant}</div>
                <div className="truncate font-mono text-[12px] text-graphite-faint">
                  {t.domain}
                </div>
              </div>

              <div className="hidden font-mono text-[13px] text-graphite-soft sm:block">
                {t.maskedToken}
              </div>

              <div className="t-num w-24 text-right text-[15px] text-graphite">
                ${t.amount.toFixed(2)}
              </div>

              <span className={`badge w-[118px] justify-center py-1 text-[12px] ${stateStyles[t.state]}`}>
                <Icon className="h-3 w-3" strokeWidth={2} />
                {t.state}
              </span>

              <div className="w-16 text-right text-[12px] text-graphite-faint">{t.time}</div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-line px-6 py-4">
        <button className="inline-flex items-center gap-1.5 text-[14px] text-accent-deep transition-colors hover:text-accent">
          View all activity
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
