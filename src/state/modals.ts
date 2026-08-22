import { create } from 'zustand'

interface ModalState {
  emergencyOpen: boolean
  newTokenOpen: boolean
  openEmergency: () => void
  closeEmergency: () => void
  openNewToken: () => void
  closeNewToken: () => void
}

export const useModals = create<ModalState>((set) => ({
  emergencyOpen: false,
  newTokenOpen: false,
  openEmergency: () => set({ emergencyOpen: true }),
  closeEmergency: () => set({ emergencyOpen: false }),
  openNewToken: () => set({ newTokenOpen: true }),
  closeNewToken: () => set({ newTokenOpen: false }),
}))
