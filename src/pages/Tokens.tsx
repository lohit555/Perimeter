import { useMemo, useState } from 'react'
import { ArrowUpDown, Layers, Plus } from 'lucide-react'
import CardPicker, { CardChip } from '../components/CardPicker'
import { StatusBadge } from '../components/Badges'
import { cardById, cards, merchants, type Merchant } from '../data/mock'
import { useModals } from '../state/modals'

type SortKey = 'site' | 'card' | 'status' | 'lastUsed'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'site', label: 'Site' },
  { key: 'card', label: 'Card' },
  { key: 'status', label: 'Status' },
  { key: 'lastUsed', label: 'Last used' },
]

const statusRank: Record<Merchant['status'], number> = {
  Active: 0,
  Paused: 1,
  Revoked: 2,
}

function TokenRow({ m }: { m: Merchant }) {
  const card = cardById(m.cardId)
  return (
    <div className="row-rule grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-paper-sunken/60">
      {/* site */}
      <div className="col-span-12 flex min-w-0 items-center gap-3 sm:col-span-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] text-white"
          style={{ backgroundColor: m.logoColor }}
        >
          {m.initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] text-graphite">{m.name}</div>
          <div className="truncate font-mono text-[11px] text-graphite-faint">
            {m.domain}
          </div>
        </div>
      </div>

      {/* token code */}
      <div className="col-span-6 sm:col-span-3">
        <div className="font-mono text-[14px] text-graphite">{m.maskedToken}</div>
        <div className="t-micro text-graphite-faint">
          {m.recurring ? 'Recurring' : 'One-off'}
        </div>
      </div>

      {/* funding card */}
      <div className="col-span-6 flex items-center gap-2 sm:col-span-3">
        {card && (
          <>
            <CardChip tone={card.tone} />
            <div className="min-w-0">
              <div className="truncate text-[14px] text-graphite">{card.label}</div>
              <div className="font-mono text-[11px] text-graphite-faint">
                •••• {card.last4}
              </div>
            </div>
          </>
        )}
      </div>

      {/* status */}
      <div className="col-span-12 flex items-center justify-between gap-3 sm:col-span-2 sm:justify-end">
        <StatusBadge status={m.status} />
        <span className="t-micro w-20 text-right text-graphite-faint">{m.lastUsed}</span>
      </div>
    </div>
  )
}

export default function Tokens() {
  const openNewToken = useModals((s) => s.openNewToken)
  const [cardFilter, setCardFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('site')
  const [asc, setAsc] = useState(true)
  const [grouped, setGrouped] = useState(true)

  const filtered = useMemo(() => {
    const list = cardFilter ? merchants.filter((m) => m.cardId === cardFilter) : merchants
    const dir = asc ? 1 : -1
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'card':
          return dir * a.cardId.localeCompare(b.cardId)
        case 'status':
          return dir * (statusRank[a.status] - statusRank[b.status])
        case 'lastUsed':
          return dir * a.lastUsed.localeCompare(b.lastUsed)
        default:
          return dir * a.name.localeCompare(b.name)
      }
    })
  }, [cardFilter, sort, asc])

  /* When grouping is on, tokens are bucketed under their funding card. */
  const groups = useMemo(() => {
    if (!grouped) return null
    return cards
      .map((c) => ({ card: c, items: filtered.filter((m) => m.cardId === c.id) }))
      .filter((g) => g.items.length > 0)
  }, [filtered, grouped])

  return (
    <div className="mx-auto max-w-[1180px] px-8 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-display text-[40px] text-graphite">Tokens</h1>
          <p className="mt-2.5 max-w-xl text-[15px] text-graphite-soft">
            Every isolated token you've issued, the site it belongs to, and the
            card funding it.
          </p>
        </div>
        <button
          onClick={openNewToken}
          className="chip border-accent bg-accent px-4 py-2.5 text-[14px] text-white hover:border-accent-deep hover:bg-accent-deep hover:text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          New token
        </button>
      </div>

      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <CardPicker value={cardFilter} onChange={setCardFilter} />

        <div className="flex items-center gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                if (sort === s.key) setAsc((a) => !a)
                else {
                  setSort(s.key)
                  setAsc(true)
                }
              }}
              className={`chip ${sort === s.key ? 'chip-active' : ''}`}
            >
              {s.label}
              {sort === s.key && (
                <ArrowUpDown className="h-3 w-3" strokeWidth={2} />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setGrouped((g) => !g)}
          className={`chip ml-auto ${grouped ? 'chip-active' : ''}`}
        >
          <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
          Group by card
        </button>
      </div>

      {/* column header */}
      <div className="mb-2.5 hidden grid-cols-12 gap-4 px-6 sm:grid">
        <div className="t-label col-span-4 text-graphite-faint">Site</div>
        <div className="t-label col-span-3 text-graphite-faint">Token</div>
        <div className="t-label col-span-3 text-graphite-faint">Card</div>
        <div className="t-label col-span-2 text-right text-graphite-faint">Status</div>
      </div>

      {groups ? (
        <div className="space-y-4">
          {groups.map(({ card, items }) => (
            <div key={card.id} className="card-flush">
              <div className="flex items-center justify-between border-b border-line bg-paper-sunken/60 px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <CardChip tone={card.tone} />
                  <span className="text-[15px] text-graphite">{card.label}</span>
                  <span className="font-mono text-[11px] text-graphite-faint">
                    •••• {card.last4}
                  </span>
                </div>
                <span className="t-micro text-graphite-faint">
                  {items.length} token{items.length === 1 ? '' : 's'}
                </span>
              </div>
              {items.map((m) => (
                <TokenRow key={m.id} m={m} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-flush">
          {filtered.map((m) => (
            <TokenRow key={m.id} m={m} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card px-5 py-12 text-center text-[13px] text-graphite-faint">
          No tokens on this card yet.
        </div>
      )}
    </div>
  )
}
