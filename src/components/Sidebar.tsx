import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth, signOut } from '../state/auth'
import { vaultApi } from '../api/vaultApi'
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
  LogOut,
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
  const { profile } = useAuth()
  const [coverage, setCoverage] = useState({ tokenized: 6, total: 7 })

  const fetchCoverage = async () => {
    try {
      const data = await vaultApi.getLedger()
      if (data && Array.isArray(data.merchants) && data.merchants.length > 0) {
        const tokenized = data.merchants.filter((m) => m.status === 'active').length
        setCoverage({ tokenized, total: data.merchants.length })
      }
    } catch (err) {
      console.warn('Vault API unavailable, keeping default coverage:', err)
    }
  }

  useEffect(() => {
    fetchCoverage()
    const handleUpdate = () => fetchCoverage()
    window.addEventListener('perimeter:data-updated', handleUpdate)
    return () => window.removeEventListener('perimeter:data-updated', handleUpdate)
  }, [])

  const coveragePct = coverage.total > 0 ? Math.round((coverage.tokenized / coverage.total) * 100) : 0

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
          <div className="h-full rounded-full bg-accent" style={{ width: `${coveragePct}%` }} />
        </div>
        <div className="mt-2 text-[12px] text-slate-500">{coverage.tokenized} of {coverage.total} sites tokenized</div>
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
        <a href="https://github.com/lohit555/Perimeter" target="_blank" rel="noreferrer" className="nav-link">
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
          {profile?.initials ?? 'U'}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[14px] text-white">{profile?.name ?? 'User'}</div>
          <div className="t-micro truncate text-slate-500">@{profile?.username ?? 'user'}</div>
        </div>
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  )
}
