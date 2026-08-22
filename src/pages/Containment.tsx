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

  const fetchAuditData = async (breachId?: string) => {
    setLoading(true)
    try {
      const auditEvents = await vaultApi.getAuditEvents(breachId)
      if (Array.isArray(auditEvents) && auditEvents.length > 0) {
        const mappedSteps: TimelineStep[] = auditEvents.map((a) => ({
          id: a.id,
          label: a.label,
          detail: a.detail,
          done: a.done,
        }))
        setSteps(mappedSteps)
        setUsingLiveApi(true)
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
    try {
      // Look up ledger to get a vendor ID (e.g. StreamFlix or ShadyDeals)
      const ledger = await vaultApi.getLedger()
      const targetVendorId = ledger.merchants[0]?.id || '907cc000-dd4a-463e-a456-457975e87ab1'
      
      const res = await vaultApi.createBreachEvent({
        vendor_id: targetVendorId,
        description: 'Reported data exposure: Performed auto-rotation containment test.',
        auto_rotate: true,
      })
      setBreachResponse(res)

      // Refresh audit timeline for this breach
      if (res?.breach_event?.id) {
        await fetchAuditData(res.breach_event.id)
      } else {
        await fetchAuditData()
      }
      window.dispatchEvent(new CustomEvent('perimeter:data-updated'))
    } catch (err) {
      console.error('Failed to trigger breach event:', err)
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Incident + timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="flex items-start gap-4 border-b border-red-100 bg-red-50/60 px-6 py-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-ink">
                    Incident: {breachResponse?.breach_event ? breachResponse.breach_event.description : 'ShadyDeals data exposure'}
                  </h2>
                  <span className="badge bg-red-100 text-red-700">Active</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {breachResponse?.breach_event
                    ? `Detected at ${new Date(breachResponse.breach_event.detected_at).toLocaleTimeString()}. Auto-rotations executed: ${breachResponse.rotations.length}.`
                    : 'Detected Aug 22, 09:14. The exposed token was isolated — no other merchant is affected.'}
                </p>
              </div>
            </div>

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
