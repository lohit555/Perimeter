import { useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, Chrome, Layers, Plus, RefreshCw, ShieldOff } from 'lucide-react'
import CardPicker, { CardChip } from '../components/CardPicker'
import { cardById, cards, merchants as mockMerchants, type TokenStatus } from '../data/mock'
import { useExtensionInstalled, useExtensionTokens } from '../state/extensionTokens'
import { useModals } from '../state/modals'
import { vaultApi, type TokenListItem } from '../api/vaultApi'

type SortKey = 'site' | 'card' | 'status' | 'lastUsed'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'site', label: 'Site' },
  { key: 'card', label: 'Card' },
  { key: 'status', label: 'Status' },
  { key: 'lastUsed', label: 'Last used' },
]

const statusRank: Record<TokenStatus, number> = { Active: 0, Paused: 1, Revoked: 2 }

interface TokenView {
  key: string
  id?: string
  name: string
  domain: string
  initials: string
  logoColor: string
  maskedToken: string
  cardId: string | null
  status: TokenStatus
  detail: string
  lastUsed: string
  fromExtension: boolean
}

const EXT_COLORS = ['#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#0891B2']

function colorFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return EXT_COLORS[Math.abs(hash) % EXT_COLORS.length]
}

function initialsFor(name: string) {
  const words = name.replace(/[^a-zA-Z ]/g, ' ').trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return (name.slice(0, 2) || '??').toUpperCase()
}

function relativeTime(iso: string | null) {
  if (!iso) return 'Never'
  try {
    const diff = Date.now() - new Date(iso).getTime()
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

const StatusPill = ({ status }: { status: TokenStatus }) => {
  const tone =
    status === 'Active'
      ? 'bg-emerald-50 text-emerald-800'
      : status === 'Paused'
      ? 'bg-amber-50 text-amber-800'
      : 'bg-rose-50 text-rose-800'
  return <span className={`badge ${tone}`}>{status}</span>
}

function TokenRow({ t, canRevoke, onRevoke }: { t: TokenView; canRevoke?: boolean; onRevoke?: (id: string) => void }) {
  const card = t.cardId ? cardById(t.cardId) : undefined
  const [revoking, setRevoking] = useState(false)

  const handleRevoke = async () => {
    if (!t.id || revoking) return
    setRevoking(true)
    try {
      await vaultApi.revokeToken(t.id)
      onRevoke?.(t.id)
    } catch (err) {
      console.error('Revoke token failed:', err)
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div className="row-rule grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-paper-sunken/60">
      <div className="col-span-12 flex min-w-0 items-center gap-3 sm:col-span-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] text-white"
          style={{ backgroundColor: t.logoColor }}
        >
          {t.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] text-graphite">{t.name}</span>
            {t.fromExtension && (
              <Chrome className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.75} />
            )}
          </div>
          <div className="truncate font-mono text-[11px] text-graphite-faint">{t.domain}</div>
        </div>
      </div>

      <div className="col-span-6 sm:col-span-3">
        <div className="font-mono text-[14px] text-graphite">{t.maskedToken}</div>
        <div className="t-micro text-graphite-faint">{t.detail}</div>
      </div>

      <div className="col-span-6 flex items-center gap-2 sm:col-span-3">
        {card ? (
          <>
            <CardChip tone={card.tone} />
            <div className="min-w-0">
              <div className="truncate text-[14px] text-graphite">{card.label}</div>
              <div className="font-mono text-[11px] text-graphite-faint">•••• {card.last4}</div>
            </div>
          </>
        ) : (
          <span className="text-[13px] text-graphite-faint">Not yet bound</span>
        )}
      </div>

      <div className="col-span-12 flex items-center justify-between gap-3 sm:col-span-2 sm:justify-end">
        <div className="flex items-center gap-2">
          <StatusPill status={t.status} />
          {canRevoke && t.id && t.status === 'Active' && (
            <button
              onClick={handleRevoke}
              disabled={revoking}
              title="Revoke Token"
              className="text-graphite-faint hover:text-rose-600 transition-colors"
            >
              <ShieldOff className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="t-micro w-20 text-right text-graphite-faint">{t.lastUsed}</span>
      </div>
    </div>
  )
}

export default function Tokens() {
  const openNewToken = useModals((s) => s.openNewToken)
  const extensionTokens = useExtensionTokens()
  const extensionInstalled = useExtensionInstalled()

  const [cardFilter, setCardFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('site')
  const [asc, setAsc] = useState(true)
  const [grouped, setGrouped] = useState(true)
  const [apiTokens, setApiTokens] = useState<TokenListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [usingLiveApi, setUsingLiveApi] = useState(false)

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const data = await vaultApi.getTokens()
      if (Array.isArray(data)) {
        setApiTokens(data)
        setUsingLiveApi(true)
      }
    } catch (err) {
      console.warn('Vault API /tokens error, using fallback mock data:', err)
      setUsingLiveApi(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
    const handleUpdate = () => fetchTokens()
    window.addEventListener('perimeter:data-updated', handleUpdate)
    return () => window.removeEventListener('perimeter:data-updated', handleUpdate)
  }, [])

  const all: TokenView[] = useMemo(() => {
    const fromApiOrMock: TokenView[] = usingLiveApi
      ? apiTokens.map((t, idx) => ({
          key: t.id,
          id: t.id,
          name: t.vendor_name,
          domain: t.vendor_domain,
          initials: initialsFor(t.vendor_name),
          logoColor: colorFor(t.vendor_domain),
          maskedToken: t.masked_value,
          cardId: cards[idx % cards.length].id,
          status: t.status === 'active' ? 'Active' : t.status === 'paused' ? 'Paused' : 'Revoked',
          detail: t.recurring ? 'Recurring' : 'One-off',
          lastUsed: relativeTime(t.last_used_at),
          fromExtension: false,
        }))
      : mockMerchants.map((m) => ({
          key: m.id,
          id: m.id,
          name: m.name,
          domain: m.domain,
          initials: m.initials,
          logoColor: m.logoColor,
          maskedToken: m.maskedToken,
          cardId: m.cardId,
          status: m.status,
          detail: m.recurring ? 'Recurring' : 'One-off',
          lastUsed: m.lastUsed,
          fromExtension: false,
        }))

    const fromExtension: TokenView[] = extensionTokens.map((t) => ({
      key: t.tokenId,
      name: t.vendor,
      domain: t.domain,
      initials: initialsFor(t.vendor),
      logoColor: colorFor(t.domain),
      maskedToken: t.maskedToken,
      cardId: null,
      status: t.status === 'revoked' ? 'Revoked' : 'Active',
      detail: 'Issued in browser',
      lastUsed: relativeTime(t.issuedAt),
      fromExtension: true,
    }))

    return [...fromExtension, ...fromApiOrMock]
  }, [apiTokens, usingLiveApi, extensionTokens])

  const filtered = useMemo(() => {
    const list = cardFilter ? all.filter((t) => t.cardId === cardFilter) : all
    const dir = asc ? 1 : -1
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'card':
          return dir * (a.cardId || 'zz').localeCompare(b.cardId || 'zz')
        case 'status':
          return dir * (statusRank[a.status] - statusRank[b.status])
        case 'lastUsed':
          return dir * a.lastUsed.localeCompare(b.lastUsed)
        default:
          return dir * a.name.localeCompare(b.name)
      }
    })
  }, [all, cardFilter, sort, asc])

  const groups = useMemo(() => {
    if (!grouped) return null
    const byCard = cards
      .map((c) => ({
        id: c.id,
        label: c.label,
        tone: c.tone,
        last4: c.last4,
        items: filtered.filter((t) => t.cardId === c.id),
      }))
      .filter((g) => g.items.length > 0)

    const unbound = filtered.filter((t) => t.cardId === null)
    return unbound.length
      ? [
          ...byCard,
          { id: 'ext', label: 'Issued in browser', tone: '#0D9488', last4: null, items: unbound },
        ]
      : byCard
  }, [filtered, grouped])

  return (
    <div className="mx-auto max-w-[1180px] px-8 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="t-display text-[40px] text-graphite">Tokens</h1>
            {usingLiveApi ? (
              <span className="badge bg-emerald-50 text-emerald-700 py-0.5 text-[11px]">Live Vault API</span>
            ) : (
              <span className="badge bg-slate-100 text-slate-600 py-0.5 text-[11px]">Mock Fallback</span>
            )}
          </div>
          <p className="mt-2.5 max-w-xl text-[15px] text-graphite-soft">
            Every isolated token you've issued, the site it belongs to, and the
            card funding it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTokens}
            title="Refresh Tokens"
            className="chip border-line px-3 py-2 text-graphite hover:border-slate-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
          </button>
          <button
            onClick={openNewToken}
            className="chip border-accent bg-accent px-4 py-2.5 text-[14px] text-white hover:border-accent-deep hover:bg-accent-deep hover:text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New token
          </button>
        </div>
      </div>

      {/* extension connection state */}
      <div className="card mb-5 flex flex-wrap items-center gap-3 px-6 py-4">
        <Chrome
          className={`h-[18px] w-[18px] ${extensionInstalled ? 'text-accent' : 'text-graphite-faint'}`}
          strokeWidth={1.75}
        />
        <span className="text-[14px] text-graphite">
          {extensionInstalled ? 'Browser extension connected' : 'Browser extension not detected'}
        </span>
        <span className="text-[13px] text-graphite-faint">
          {extensionInstalled
            ? `${extensionTokens.length} token${extensionTokens.length === 1 ? '' : 's'} issued from checkout pages`
            : 'Load the extension and issue a token — it will appear here automatically.'}
        </span>
      </div>

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
              {sort === s.key && <ArrowUpDown className="h-3 w-3" strokeWidth={2} />}
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

      <div className="mb-2.5 hidden grid-cols-12 gap-4 px-6 sm:grid">
        <div className="t-label col-span-4 text-graphite-faint">Site</div>
        <div className="t-label col-span-3 text-graphite-faint">Token</div>
        <div className="t-label col-span-3 text-graphite-faint">Card</div>
        <div className="t-label col-span-2 text-right text-graphite-faint">Status</div>
      </div>

      {groups ? (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="card-flush">
              <div className="flex items-center justify-between border-b border-line bg-paper-sunken/60 px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <CardChip tone={g.tone} />
                  <span className="text-[15px] text-graphite">{g.label}</span>
                  {g.last4 && (
                    <span className="font-mono text-[11px] text-graphite-faint">
                      •••• {g.last4}
                    </span>
                  )}
                </div>
                <span className="t-micro text-graphite-faint">
                  {g.items.length} token{g.items.length === 1 ? '' : 's'}
                </span>
              </div>
              {g.items.map((t) => (
                <TokenRow key={t.key} t={t} canRevoke={usingLiveApi} onRevoke={() => fetchTokens()} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card-flush">
          {filtered.map((t) => (
            <TokenRow key={t.key} t={t} canRevoke={usingLiveApi} onRevoke={() => fetchTokens()} />
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
