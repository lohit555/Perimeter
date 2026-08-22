import { fundingSource, merchants } from '../data/mock'
import { MerchantLogo } from './Badges'

/**
 * Token Isolation Map — central funding source branching out to merchants.
 * Pure SVG/CSS radial layout, no external charting lib.
 */
export default function TokenIsolationMap() {
  const nodes = merchants.slice(0, 5)
  const cx = 110
  const cy = 150
  const radius = 110

  return (
    <div className="card p-6">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Token Isolation Map</h3>
          <p className="text-xs text-slate-400">One funding source, isolated per-merchant tokens</p>
        </div>
        <span className="badge bg-teal-50 text-teal-700">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          Isolated
        </span>
      </div>

      <div className="relative mx-auto mt-2 h-[300px] w-full max-w-[560px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 300" preserveAspectRatio="xMidYMid meet">
          {/* connectors */}
          {nodes.map((_, i) => {
            const angle = (Math.PI / 4) * (i - (nodes.length - 1) / 2) - Math.PI / 2
            const x = 280 + Math.cos(angle) * 200
            const y = 150 + Math.sin(angle) * 110
            return (
              <line
                key={i}
                x1="280"
                y1="150"
                x2={x}
                y2={y}
                stroke="#0D9488"
                strokeWidth="1.5"
                strokeOpacity="0.35"
                strokeDasharray="4 4"
              />
            )
          })}
        </svg>

        {/* center funding source */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-white shadow-pop">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-semibold text-ink">{fundingSource.label}</div>
              <div className="text-[11px] text-slate-400">Funding source</div>
            </div>
          </div>
        </div>

        {/* merchant nodes positioned around the center */}
        {nodes.map((m, i) => {
          const angle = (Math.PI / 4) * (i - (nodes.length - 1) / 2) - Math.PI / 2
          const leftPct = 50 + (Math.cos(angle) * 200) / 5.6
          const topPct = 50 + (Math.sin(angle) * 110) / 3
          return (
            <div
              key={m.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <div className="flex flex-col items-center">
                <MerchantLogo initials={m.initials} color={m.logoColor} size="sm" />
                <div className="mt-1.5 text-[11px] font-medium text-ink">{m.name}</div>
                <div className="text-[10px] text-slate-400">{m.maskedToken.slice(-4)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
