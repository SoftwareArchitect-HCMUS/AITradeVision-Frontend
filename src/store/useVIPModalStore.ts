import { create } from 'zustand'

interface VIPModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useVIPModalStore = create<VIPModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
