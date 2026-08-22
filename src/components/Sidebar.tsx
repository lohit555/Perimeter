import { NavLink } from 'react-router-dom'
import {
  ChevronRight,
  Coins,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

const nav = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/tokens', label: 'Tokens', icon: Coins, end: false },
  { to: '/ledger', label: 'Ledger', icon: ScrollText, end: false },
  { to: '/containment', label: 'Containment', icon: ShieldAlert, end: false },
]

const footerNav = [
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export default function Sidebar({ onEmergency }: { onEmergency: () => void }) {
  return (
    <aside className="bg-night-flat flex w-[264px] shrink-0 flex-col text-white">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <ShieldCheck className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />
        </div>
        <div className="leading-tight">
          <div className="headline text-[17px] text-white">Perimeter</div>
          <div className="t-micro text-slate-500">Token isolation</div>
        </div>
      </div>

      {/* protection status — the reference's setup card, in our terms */}
      <div className="mx-4 mb-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
        <button className="flex w-full items-center justify-between text-left">
          <span className="text-[14px] text-white">Perimeter coverage</span>
          <ChevronRight className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
        </button>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[86%] rounded-full bg-accent" />
        </div>
        <div className="mt-2 text-[12px] text-slate-500">6 of 7 sites tokenized</div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <button
          onClick={onEmergency}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[14px] text-red-300 transition-colors hover:bg-red-500/15"
        >
          <Lock className="h-4 w-4" strokeWidth={1.75} />
          Emergency lock
        </button>
      </div>

      <div className="space-y-1 px-3 pb-2">
        <a href="#" className="nav-link">
          <LifeBuoy className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Resources
        </a>
        {footerNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* account */}
      <div className="mt-1 flex items-center gap-3 border-t border-white/[0.08] px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[12px] text-white">
          AR
        </div>
        <div className="leading-tight">
          <div className="text-[14px] text-white">Aaryan</div>
          <div className="t-micro text-slate-500">Owner</div>
        </div>
      </div>
    </aside>
  )
}
