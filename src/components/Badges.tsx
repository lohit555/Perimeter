import type { TokenStatus, RiskLevel } from '../data/mock'

const statusStyles: Record<TokenStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Paused: 'bg-amber-50 text-amber-700',
  Revoked: 'bg-red-50 text-red-700',
}

const riskStyles: Record<RiskLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-700',
}

const dot: Record<string, string> = {
  Active: 'bg-emerald-500',
  Paused: 'bg-amber-500',
  Revoked: 'bg-red-500',
  Low: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  High: 'bg-red-500',
}

export function StatusBadge({ status }: { status: TokenStatus }) {
  return (
    <span className={`badge ${statusStyles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`badge ${riskStyles[risk]}`}>{risk} Risk</span>
}

export function MerchantLogo({
  initials,
  color,
  size = 'md',
}: {
  initials: string
  color: string
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-lg font-bold text-white`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
