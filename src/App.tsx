import { Navigate, Routes, Route } from 'react-router-dom'
import type { ReactElement } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Tokens from './pages/Tokens'
import Containment from './pages/Containment'
import Settings from './pages/Settings'
import Hero from './pages/Hero'
import Login from './pages/Login'
import { useAuth } from './state/auth'

function RequireAuth({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-graphite">
        <div className="text-sm text-graphite-soft">Loading…</div>
      </div>
    )
  }
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tokens" element={<Tokens />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/containment" element={<Containment />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
