import { useState } from 'react'
import Modal from './Modal'
import { Lock, ShieldAlert } from 'lucide-react'

export default function EmergencyLockModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const [locked, setLocked] = useState(false)

  const reset = () => {
    setConfirm(false)
    setLocked(false)
  }

  return (
    <Modal open={open} onClose={() => { onClose(); reset() }} title="Emergency Lock" accent="bg-red-500" maxWidth="max-w-md">
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

        {locked ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <div className="text-base font-semibold text-ink">All tokens locked</div>
              <p className="mt-1 text-sm text-slate-500">6 tokens paused. Resume from Settings when ready.</p>
            </div>
            <button className="btn btn-ghost mt-2" onClick={() => { onClose(); reset() }}>
              Close
            </button>
          </div>
        ) : (
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
              <button className="btn btn-ghost" onClick={() => { onClose(); reset() }}>
                Cancel
              </button>
              <button className="btn btn-danger" disabled={!confirm} onClick={() => setLocked(true)}>
                <Lock className="h-4 w-4" />
                Lock All Tokens
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
