import { useEffect, useState } from 'react'
import { containmentSteps as mockSteps, protectedMerchants as mockProtected } from '../data/mock'
import { ShieldCheck, ShieldAlert, CheckCircle2, Circle, RefreshCw, Zap } from 'lucide-react'
import { MerchantLogo } from '../components/Badges'
import { vaultApi, type AuditEventRead, type BreachEventResponse } from '../api/vaultApi'

const palette = ['#E11D48', '#FF9900', '#0F172A', '#1DB954', '#2563EB']

interface TimelineStep {
  id: string | number
  label: string
  detail: string
  done: boolean
}

export default function Containment() {
  const [steps, setSteps] = useState<TimelineStep[]>(mockSteps)
  const [protectedList, setProtectedList] = useState<string[]>(mockProtected)
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [breachResponse, setBreachResponse] = useState<BreachEventResponse | null>(null)
  const [usingLiveApi, setUsingLiveApi] = useState(false)
  const [triggerError, setTriggerError] = useState<string | null>(null)
  const contained = breachResponse !== null && breachResponse.rotations.length > 0

  const fetchAuditData = async (breachId?: string) => {
    setLoading(true)
    try {
      const auditEvents = await vaultApi.getAuditEvents(breachId)
      if (Array.isArray(auditEvents)) {
        // Emergency Lock / Resume events are written without a breach_event_id —
        // never let them into the containment timeline, or every past test run
        // piles up as "N token(s) paused" entries.
        const containmentEvents = auditEvents.filter((a) => a.breach_event_id)
        if (containmentEvents.length > 0) {
          // Group by breach and show only the latest breach's trail, so the
          // timeline stays one coherent story instead of every token mixed together.
          const groups = new Map<string, AuditEventRead[]>()
          for (const a of containmentEvents) {
            const key = a.breach_event_id ?? 'unattached'
            if (!groups.has(key)) groups.set(key, [])
            groups.get(key)!.push(a)
          }
          let latest: AuditEventRead[] = []
          for (const g of groups.values()) {
            g.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const lastTime = new Date(g[g.length - 1].created_at).getTime()
            const currentLast = latest.length
              ? new Date(latest[latest.length - 1].created_at).getTime()
              : 0
            if (!latest.length || lastTime > currentLast) latest = g
          }
          if (latest.length > 0) {
            const mappedSteps: TimelineStep[] = latest.map((a) => ({
              id: a.id,
              label: a.label,
              detail: a.detail,
              done: a.done,
            }))
            setSteps(mappedSteps)
            setUsingLiveApi(true)
          }
        } else {
          // API is live but no real containment trail exists yet — show a clean
          // placeholder instead of stale mock steps.
          setSteps([
            {
              id: 'empty',
              label: 'No containment events yet',
              detail: 'Click "Simulate Breach Event" to trigger automatic containment and watch the live trail fill in.',
              done: false,
            },
          ])
          setUsingLiveApi(true)
        }
      }

      // Fetch live ledger to update protected merchants
      const ledger = await vaultApi.getLedger()
      if (ledger && Array.isArray(ledger.merchants)) {
        const activeProtected = ledger.merchants
          .filter((m) => m.status === 'active')
          .map((m) => m.name)
        if (activeProtected.length > 0) {
          setProtectedList(activeProtected)
        }
        setUsingLiveApi(true)
      }
    } catch (err) {
      console.warn('Vault API audit/containment unavailable, using mock fallback:', err)
      setUsingLiveApi(false)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerBreach = async () => {
    setTriggering(true)
    setTriggerError(null)
    try {
      // The ledger's merchant id is the TOKEN id, not the vendor id — the
      // vault's /breach-events endpoint needs the vendor. Pull the vendor
      // from /tokens, which carries both.
      const tokens = await vaultApi.getTokens()
      const target = tokens.find((t) => t.status === 'active') || tokens[0]
      const targetVendorId = target?.vendor_id || '907cc000-dd4a-463e-a456-457975e87ab1'
      const targetVendorName = target?.vendor_name || 'StreamFlix'

      const res = await vaultApi.createBreachEvent({
        vendor_id: targetVendorId,
        description: `Reported data exposure at ${targetVendorName}: Performed auto-rotation containment test.`,
        auto_rotate: true,
      })
      setBreachResponse(res)

      // The vault API's auto_rotate writes no audit trail, so build the
      // containment timeline client-side from the actual rotation result —
      // each step names the specific token that was revoked / replaced.
      if (res && res.rotations.length > 0) {
        const tokens = await vaultApi.getTokens()
        const maskOf = new Map(tokens.map((t) => [t.id, t.masked_value]))
        const rotation = res.rotations[0]
        const oldMask = maskOf.get(rotation.old_token_id) || 'a compromised token'
        const newMask = maskOf.get(rotation.new_token_id) || 'a fresh token'
        setSteps([
          { id: 'locate', label: 'Token Located', detail: `${oldMask} located for ${targetVendorName}.`, done: true },
          { id: 'revoke', label: 'Token Revoked', detail: `${oldMask} permanently revoked — no further charges possible.`, done: true },
          { id: 'replace', label: 'Replacement Issued', detail: `Replacement ${newMask} issued for ${targetVendorName}.`, done: true },
          { id: 'notify', label: 'User Notified', detail: `Perimeter contained the ${targetVendorName} breach. Other merchant tokens remain active.`, done: true },
        ])
      } else {
        setSteps([
          { id: 'none', label: 'No Active Token', detail: `Breach received, but no active token was found for ${targetVendorName}. No containment was necessary.`, done: true },
        ])
      }
      window.dispatchEvent(new CustomEvent('perimeter:data-updated'))
    } catch (err) {
      console.error('Failed to trigger breach event:', err)
      setTriggerError("Could not reach the vault — the breach event was not created. Check that the vault is up, then try again.")
    } finally {
      setTriggering(false)
    }
  }

  useEffect(() => {
    fetchAuditData()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink">Breach Containment</h1>
            {usingLiveApi ? (
              <span className="badge bg-emerald-50 text-emerald-700 py-0.5 text-[11px]">Live Vault API</span>
            ) : (
              <span className="badge bg-slate-100 text-slate-600 py-0.5 text-[11px]">Mock Fallback</span>
            )}
          </div>
          <p className="text-sm text-slate-400">Isolate, revoke, and replace — without touching other merchants.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAuditData()}
            title="Refresh Timeline"
            className="btn btn-ghost px-3 py-2 text-slate-500"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleTriggerBreach}
            disabled={triggering}
            className="btn bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Zap className="h-4 w-4" />
            {triggering ? 'Containment active...' : 'Simulate Breach Event'}
          </button>
        </div>
      </div>

      {triggerError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {triggerError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Incident + timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            {breachResponse ? (
              <>
                <div className="flex items-start gap-4 border-b border-red-100 bg-red-50/60 px-6 py-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">
                        Incident: {breachResponse.breach_event.description}
                      </h2>
                      {contained ? (
                        <span className="badge bg-emerald-100 text-emerald-700">Contained</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-700">Active</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Detected at {new Date(breachResponse.breach_event.detected_at).toLocaleTimeString()}. Auto-rotations executed: {breachResponse.rotations.length}.
                    </p>
                  </div>
                </div>

                {contained && (
                  <div className="flex items-center gap-4 border-b border-teal-100 bg-teal-50/70 px-6 py-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100">
                      <CheckCircle2 className="h-7 w-7 text-teal" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-teal-800">Breach contained</div>
                      <div className="mt-0.5 text-sm text-teal-700">
                        {breachResponse.rotations.length} compromised token{breachResponse.rotations.length === 1 ? ' was' : 's were'} revoked and replaced automatically. No human action required — every other merchant is untouched.
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-4 border-b border-emerald-100 bg-emerald-50/60 px-6 py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">No active incidents</h2>
                    <span className="badge bg-emerald-100 text-emerald-700">All clear</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Perimeter is monitoring every merchant. Click "Simulate Breach Event" to watch automatic containment in action.
                  </p>
                </div>
              </div>
            )}

            <div className="px-6 py-6">
              <h3 className="mb-5 text-sm font-semibold text-ink">Containment timeline</h3>
              <ol className="space-y-0">
                {steps.map((step, i) => (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.done ? (
                        <CheckCircle2 className="h-7 w-7 text-teal" />
                      ) : (
                        <Circle className="h-7 w-7 text-slate-300" />
                      )}
                      {i < steps.length - 1 && (
                        <div className={`my-1 w-px flex-1 ${step.done ? 'bg-teal/40' : 'bg-slate-200'}`} style={{ minHeight: '2.5rem' }} />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className={`text-sm font-semibold ${step.done ? 'text-ink' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                      <div className="text-sm text-slate-500">{step.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Protected side panel */}
        <div className="card p-6">
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal" />
            <h3 className="text-sm font-semibold text-ink">Other merchants: Protected</h3>
          </div>
          <p className="mb-4 text-xs text-slate-400">
            Isolation means this breach cannot spread. These tokens were never shared with the exposed merchant.
          </p>
          <ul className="space-y-3">
            {protectedList.map((name, i) => (
              <li key={name} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                <MerchantLogo initials={name.slice(0, 2).toUpperCase()} color={palette[i % palette.length]} size="sm" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{name}</div>
                  <div className="text-xs text-slate-400">Token untouched</div>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Protected
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
