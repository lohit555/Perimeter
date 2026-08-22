import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import EmergencyLockModal from './EmergencyLockModal'
import NewTokenModal from './NewTokenModal'
import { useModals } from '../state/modals'

export default function Layout() {
  const { emergencyOpen, newTokenOpen, closeEmergency, closeNewToken } = useModals()
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar onEmergency={() => useModals.getState().openEmergency()} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="scroll-area flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <EmergencyLockModal open={emergencyOpen} onClose={closeEmergency} />
      <NewTokenModal open={newTokenOpen} onClose={closeNewToken} />
    </div>
  )
}
