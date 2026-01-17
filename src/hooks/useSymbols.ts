import { useQuery } from '@tanstack/react-query'
import { MarketService } from '@/services/market.service'

export function useSymbols() {
  return useQuery({
    queryKey: ['symbols'],
    queryFn: async () => {
      const marketService = MarketService.getInstance()
      const response = await marketService.getSupportedSymbols()
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch symbols')
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
