import { activity } from '../data/mock'
import { RefreshCw, ShieldOff, ShieldX, BadgeCheck, Gauge } from 'lucide-react'

const iconMap = {
  rotation: { icon: RefreshCw, tint: 'text-teal', bg: 'bg-teal-50' },
  blocked: { icon: ShieldX, tint: 'text-red-600', bg: 'bg-red-50' },
  revoked: { icon: ShieldOff, tint: 'text-red-600', bg: 'bg-red-50' },
  issued: { icon: BadgeCheck, tint: 'text-emerald-600', bg: 'bg-emerald-50' },
  limit: { icon: Gauge, tint: 'text-amber-600', bg: 'bg-amber-50' },
}

export default function ActivityFeed() {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Activity Feed</h3>
        <span className="text-xs text-slate-400">Last 24 hours</span>
      </div>
      <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-1 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
        {activity.map((e) => {
          const cfg = iconMap[e.type]
          return (
            <li key={e.id} className="relative flex gap-3.5 pl-0">
              <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                <cfg.icon className={`h-4 w-4 ${cfg.tint}`} />
              </span>
              <div className="pt-0.5">
                <div className="text-sm font-medium text-ink">{e.merchant}</div>
                <div className="text-sm text-slate-500">{e.detail}</div>
                <div className="mt-0.5 text-xs text-slate-400">{e.time}</div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
