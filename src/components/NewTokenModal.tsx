import { useState } from 'react'
import Modal from './Modal'
import { Plus, Check } from 'lucide-react'

export default function NewTokenModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [merchant, setMerchant] = useState('')
  const [domain, setDomain] = useState('')
  const [limit, setLimit] = useState('200')
  const [oneTime, setOneTime] = useState(false)
  const [autoExpiry, setAutoExpiry] = useState(false)
  const [merchantLock, setMerchantLock] = useState(true)

  return (
    <Modal open={open} onClose={onClose} title="Create Isolated Token" accent="bg-teal">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Merchant name</label>
            <input className="input" placeholder="e.g. StreamFlix" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Domain</label>
            <input className="input" placeholder="streamflix.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Monthly spending limit</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input type="number" className="input pl-7" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-1 text-xs font-semibold text-slate-600">Advanced options</div>
          <div className="space-y-1">
            <Toggle label="One-time use" desc="Token self-destructs after a single charge." checked={oneTime} onChange={setOneTime} />
            <Toggle label="Auto-expiry" desc="Token expires at the end of the billing cycle." checked={autoExpiry} onChange={setAutoExpiry} />
            <Toggle label="Merchant lock" desc="Only the specified domain can charge this token." checked={merchantLock} onChange={setMerchantLock} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Create Token
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-white"
    >
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-slate-400">{desc}</span>
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-teal' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-all ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        >
          {checked && <Check className="h-3 w-3 text-teal" />}
        </span>
      </span>
    </button>
  )
}
