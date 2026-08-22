import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  ShieldAlert,
  Lock,
  Settings,
  ShieldCheck,
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ledger', label: 'Exposure Ledger', icon: CreditCard, end: false },
  { to: '/containment', label: 'Breach Containment', icon: ShieldAlert, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export default function Sidebar({ onEmergency }: { onEmergency: () => void }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10">
          <ShieldCheck className="h-5 w-5 text-teal" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-ink">Perimeter</div>
          <div className="text-[11px] font-medium text-slate-400">Token Isolation</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button onClick={onEmergency} className="btn btn-danger w-full">
          <Lock className="h-4 w-4" />
          Emergency Lock
        </button>
      </div>
    </aside>
  )
}
