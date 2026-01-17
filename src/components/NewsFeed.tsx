import { NewsCard } from "./NewsCard";
import { Newspaper } from "lucide-react";
import { useInfiniteNews } from "@/hooks/useNews";
import { useCallback, useEffect, useRef, useState } from "react";
import { NewsDetailPanel } from "./NewsDetailPanel";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  summary?: string;
  fullText: string;
  url: string;
}

// Map NewsData from backend to NewsItem for frontend
function mapNewsDataToNewsItem(newsData: import('@/services/market.service').NewsData[]): NewsItem[] {
  return newsData.map(news => ({
    id: news.id.toString(),
    title: news.title,
    source: news.source,
    timestamp: new Date(news.publishTime),
    summary: news.summary,
    fullText: news.fullText,
    url: news.url
  }));
}

export function NewsFeed() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteNews();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const newsItems = (data as any)?.pages?.flatMap((page: any) => mapNewsDataToNewsItem(page.news)) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMore]);

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 p-4 border-b border-border flex-shrink-0">
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Latest News</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading news...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load news. Please try again later.
            </p>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No news available at the moment.
            </p>
          </div>
        ) : (
          <>
            {          newsItems.map((news: NewsItem) => (
            <NewsCard key={news.id} news={news} onClick={(selectedNews) => setSelectedNews(selectedNews)} />
          ))}

            {hasNextPage && (
              <div ref={loadMoreRef} className="flex items-center justify-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading more news...</span>
                  </div>
                ) : (
                  <div className="h-4" />
                )}
              </div>
            )}

            {!hasNextPage && newsItems.length > 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  No more news to load
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    <NewsDetailPanel
      news={selectedNews}
      isOpen={!!selectedNews}
      onClose={() => setSelectedNews(null)}
    />
    </>
  );
}

