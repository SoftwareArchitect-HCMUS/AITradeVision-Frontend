import { useInfiniteQuery } from '@tanstack/react-query'
import { MarketService } from '@/services/market.service'
import type { NewsListResponse } from '@/services/market.service'

export function useInfiniteNews(limit: number = 20) {
  return useInfiniteQuery<NewsListResponse, Error, NewsListResponse, (string | number)[]>({
    queryKey: ['news', limit],
    queryFn: async ({ pageParam = 1 }: { pageParam?: unknown }) => {
      const marketService = MarketService.getInstance()
      const response = await marketService.getNews(limit, pageParam as number)
      if (response.success) {
        return response.data
      }
      throw new Error(response.message || 'Failed to fetch news')
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((total, page) => total + page.news.length, 0)
      return totalLoaded < lastPage.total ? allPages.length + 1 : undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
