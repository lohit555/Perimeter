import { useState } from 'react'
import { ArrowRight, CreditCard } from 'lucide-react'
import { cards, merchants } from '../data/mock'
import { MerchantLogo } from './Badges'
import CardPicker from './CardPicker'

/**
 * Token Isolation Map — one funding card at the centre, its isolated
 * per-site tokens fanned out around it. Pure SVG/CSS, no charting lib.
 */
export default function TokenIsolationMap() {
  const [cardId, setCardId] = useState<string>(cards[0].id)
  const card = cards.find((c) => c.id === cardId)!
  const scoped = merchants.filter((m) => m.cardId === cardId)
  const nodes = scoped.slice(0, 5)

  return (
    <div className="card-flush flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
        <h2 className="t-title text-[20px] text-graphite">Token isolation map</h2>
        <CardPicker value={cardId} onChange={(id) => setCardId(id ?? cards[0].id)} allowAll={false} />
      </div>

      <div className="relative flex-1 px-6 py-8">
        {nodes.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-[13px] text-graphite-faint">
            No tokens issued on this card yet.
          </div>
        ) : (
          <div className="relative mx-auto h-[260px] w-full max-w-[520px]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 520 260"
              preserveAspectRatio="xMidYMid meet"
            >
              {nodes.map((_, i) => {
                const angle =
                  (Math.PI / 4.4) * (i - (nodes.length - 1) / 2) - Math.PI / 2
                const x = 260 + Math.cos(angle) * 185
                const y = 165 + Math.sin(angle) * 105
                return (
                  <line
                    key={i}
                    x1="260"
                    y1="165"
                    x2={x}
                    y2={y}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                )
              })}
            </svg>

            {/* merchant nodes */}
            {nodes.map((m, i) => {
              const angle = (Math.PI / 4.4) * (i - (nodes.length - 1) / 2) - Math.PI / 2
              const leftPct = 50 + (Math.cos(angle) * 185) / 5.2
              const topPct = 63 + (Math.sin(angle) * 105) / 2.6
              return (
                <div
                  key={m.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                >
                  <div className="flex flex-col items-center">
                    <MerchantLogo initials={m.initials} color={m.logoColor} size="sm" />
                    <div className="mt-1.5 text-[12px] text-graphite">{m.name}</div>
                    <div className="font-mono text-[10px] text-graphite-faint">
                      {m.maskedToken.slice(-4)}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* funding card at the centre */}
            <div
              className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ top: '63%' }}
            >
              <div className="flex flex-col items-center">
                <div
                  className="flex h-12 w-16 items-center justify-center rounded-lg"
                  style={{ backgroundColor: card.tone }}
                >
                  <CreditCard className="h-5 w-5 text-white/85" strokeWidth={1.5} />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[12px] text-graphite">{card.label}</div>
                  <div className="font-mono text-[10px] text-graphite-faint">
                    •••• {card.last4}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line px-6 py-4">
        <span className="text-[13px] text-graphite-faint">
          {scoped.length} token{scoped.length === 1 ? '' : 's'} on this card
        </span>
        <a
          href="/tokens"
          className="inline-flex items-center gap-1.5 text-[14px] text-accent-deep transition-colors hover:text-accent"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </a>
      </div>
    </div>
  )
}
