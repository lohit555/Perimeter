import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cards, type Card } from '../data/mock'

/** Small mark standing in for the card network, tinted with the card's tone. */
function CardChip({ tone }: { tone: string }) {
  return (
    <span
      className="flex h-4 w-6 shrink-0 items-center justify-center rounded-[3px]"
      style={{ backgroundColor: tone }}
    >
      <span className="h-1.5 w-2.5 rounded-[1px] bg-white/35" />
    </span>
  )
}

export function cardLabel(card: Card) {
  return `${card.label} ${card.last4}-••••`
}

/**
 * Funding-card selector. `value === null` means "all cards".
 * Closes on outside click and on Escape.
 */
export default function CardPicker({
  value,
  onChange,
  allowAll = true,
}: {
  value: string | null
  onChange: (id: string | null) => void
  allowAll?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = cards.find((c) => c.id === value) ?? null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="chip w-full justify-between sm:w-auto"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <CardChip tone={selected.tone} />
              <span className="text-graphite">{selected.label}</span>
              <span className="font-mono text-[12px] text-graphite-faint">
                {selected.last4}-••••
              </span>
            </>
          ) : (
            <span className="text-graphite">All cards</span>
          )}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-graphite-faint" strokeWidth={2} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-1.5 w-60 overflow-hidden rounded-lg border border-line bg-paper-raised py-1"
        >
          {allowAll && (
            <button
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-graphite hover:bg-paper-sunken"
            >
              All cards
              {value === null && <Check className="h-3.5 w-3.5 text-accent-deep" strokeWidth={2} />}
            </button>
          )}
          {cards.map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={value === c.id}
              onClick={() => {
                onChange(c.id)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-paper-sunken"
            >
              <span className="flex items-center gap-2">
                <CardChip tone={c.tone} />
                <span className="text-[13px] text-graphite">{c.label}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-graphite-faint">{c.last4}</span>
                {value === c.id && (
                  <Check className="h-3.5 w-3.5 text-accent-deep" strokeWidth={2} />
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { CardChip }
