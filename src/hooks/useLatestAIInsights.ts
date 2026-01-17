import { useQuery } from '@tanstack/react-query';
import { MarketService } from '@/services/market.service';

/**
 * Hook to get latest AI insights across all symbols
 */
export function useLatestAIInsights(limit: number = 20) {
  return useQuery({
    queryKey: ['ai-insights-latest', limit],
    queryFn: async () => {
      const marketService = MarketService.getInstance();
      const response = await marketService.getLatestAIInsights(limit);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch latest AI insights');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get AI insights for a specific news article
 */
export function useAIInsightsByNews(newsId: number | null) {
  return useQuery({
    queryKey: ['ai-insights-news', newsId],
    queryFn: async () => {
      if (!newsId) return [];
      const marketService = MarketService.getInstance();
      const response = await marketService.getAIInsightsByNewsId(newsId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch AI insights for news');
    },
    enabled: !!newsId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
