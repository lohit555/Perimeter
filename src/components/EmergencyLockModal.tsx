import { useState } from 'react'
import Modal from './Modal'
import { Lock, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react'
import { vaultApi } from '../api/vaultApi'

type Phase = 'confirm' | 'locked' | 'resumed'

export default function EmergencyLockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockedCount, setLockedCount] = useState(0)
  const [resumedCount, setResumedCount] = useState(0)

  const reset = () => {
    setConfirm(false)
    setPhase('confirm')
    setBusy(false)
    setError(null)
  }

  const close = () => {
    onClose()
    reset()
  }

  const refreshDashboard = () => {
    window.dispatchEvent(new CustomEvent('perimeter:data-updated'))
  }

  const handleLock = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await vaultApi.emergencyLock()
      setLockedCount(res.locked_count)
      setPhase('locked')
      refreshDashboard()
    } catch (err) {
      console.error('Emergency lock failed:', err)
      setError("Couldn't reach the vault. Your tokens were not locked. Try again.")
    } finally {
      setBusy(false)
    }
  }

  const handleResume = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await vaultApi.emergencyLockResume()
      setResumedCount(res.resumed_count)
      setPhase('resumed')
      refreshDashboard()
    } catch (err) {
      console.error('Emergency lock resume failed:', err)
      setError("Couldn't reach the vault. Your tokens may still be paused.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title="Emergency Lock" accent="bg-red-500" maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
          <div>
            <div className="text-sm font-semibold text-red-900">Pause all token activity</div>
            <p className="mt-1 text-sm text-red-700/90">
              Every active token will be immediately paused. No merchant will be able to charge any
              token until you manually resume activity.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {phase === 'locked' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <div className="text-base font-semibold text-ink">All tokens locked</div>
              <p className="mt-1 text-sm text-slate-500">
                {lockedCount} token{lockedCount === 1 ? '' : 's'} paused across all merchants.
              </p>
            </div>
            <div className="mt-2 flex gap-3">
              <button
                className="btn btn-ghost"
                onClick={close}
                disabled={busy}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleResume}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Resume activity
              </button>
            </div>
          </div>
        )}

        {phase === 'resumed' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <div className="text-base font-semibold text-ink">Activity resumed</div>
              <p className="mt-1 text-sm text-slate-500">
                {resumedCount} token{resumedCount === 1 ? '' : 's'} are active again.
              </p>
            </div>
            <button className="btn btn-ghost mt-2" onClick={close}>
              Close
            </button>
          </div>
        )}

        {phase === 'confirm' && (
          <>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal/20"
              />
              <span className="text-sm text-slate-600">
                I understand this immediately pauses all merchant tokens and blocks every pending charge.
              </span>
            </label>
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost" onClick={close} disabled={busy}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={!confirm || busy}
                onClick={handleLock}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Lock All Tokens
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
