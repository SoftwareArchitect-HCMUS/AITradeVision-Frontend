import { create } from 'zustand'

interface ProfileModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useProfileModalStore = create<ProfileModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
