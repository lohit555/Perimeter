import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Tokens from './pages/Tokens'
import Containment from './pages/Containment'
import Settings from './pages/Settings'
import Hero from './pages/Hero'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
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
