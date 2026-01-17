import { useQuery } from '@tanstack/react-query'
import { MarketService } from '@/services/market.service'

export function useAIInsights(symbol?: string, limit: number = 10) {
  return useQuery({
    queryKey: ['ai-insights', symbol, limit],
    queryFn: async () => {
      const marketService = MarketService.getInstance()
      const response = await marketService.getAIInsights(symbol, limit)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch AI insights')
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
