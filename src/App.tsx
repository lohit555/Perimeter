import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Containment from './pages/Containment'
import Settings from './pages/Settings'
import Hero from './pages/Hero'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/hero" element={<Hero />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/containment" element={<Containment />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
