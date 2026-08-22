import { ShieldCheck, Bell, Lock, KeyRound } from 'lucide-react'

export default function Settings() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-slate-400">Account and security preferences.</p>
      </div>

      <div className="space-y-4">
        <SettingRow icon={KeyRound} title="Default token spending limit" desc="$200 per merchant, per month" />
        <SettingRow icon={Bell} title="Breach notifications" desc="Email + push for every contained incident" on />
        <SettingRow icon={Lock} title="Require confirmation for Emergency Lock" desc="Two-step confirmation before pausing all tokens" on />
        <SettingRow icon={ShieldCheck} title="Auto-isolate on breach match" desc="Automatically revoke a token when matched to a reported breach" on />
      </div>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  title,
  desc,
  on,
}: {
  icon: typeof ShieldCheck
  title: string
  desc: string
  on?: boolean
}) {
  return (
    <div className="card flex items-center justify-between p-5">
      <div className="flex items-center gap-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
          <Icon className="h-5 w-5 text-teal" />
        </span>
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          <div className="text-xs text-slate-400">{desc}</div>
        </div>
      </div>
      {on !== undefined && (
        <span className={`relative h-5 w-9 rounded-full ${on ? 'bg-teal' : 'bg-slate-300'}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
        </span>
      )}
    </div>
  )
}
