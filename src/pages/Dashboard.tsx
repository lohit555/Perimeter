import TokenIsolationMap from '../components/TokenIsolationMap'
import SecuritySummary from '../components/SecuritySummary'
import ActivityFeed from '../components/ActivityFeed'
import { Plus } from 'lucide-react'
import { useModals } from '../state/modals'

export default function Dashboard() {
  const openNewToken = useModals((s) => s.openNewToken)
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-slate-400">Your payment exposure, isolated and monitored.</p>
        </div>
        <button className="btn btn-primary" onClick={openNewToken}>
          <Plus className="h-4 w-4" />
          New Token
        </button>
      </div>

      <div className="space-y-6">
        <SecuritySummary />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TokenIsolationMap />
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
