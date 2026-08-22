import { Search, Bell } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search merchants, tokens, incidents…"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-2.5 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
            AK
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-ink">Alex Kim</div>
            <div className="text-[11px] text-slate-400">Security Admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}
