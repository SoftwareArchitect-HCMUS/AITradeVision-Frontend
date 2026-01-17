import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SymbolState {
  selectedSymbol: string
  setSelectedSymbol: (symbol: string) => void
}

export const useSymbolStore = create<SymbolState>()(
  persist(
    (set) => ({
      selectedSymbol: 'BTCUSDT',
      setSelectedSymbol: (symbol: string) => {
        set({ selectedSymbol: symbol })
      },
    }),
    {
      name: 'symbol',
      partialize: (state) => ({
        selectedSymbol: state.selectedSymbol,
      }),
    }
  )
)

