import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { CandlestickChart } from "@/components/CandlestickChart"
import { RightPanel } from "@/components/RightPanel"
import { NewsDetailPanel } from "@/components/NewsDetailPanel"
import { type TradingPair, type Timeframe } from "@/types/trading"
import { useSymbolStore } from "@/store/useSymbolStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useWebSocketPrice } from "@/hooks/useWebSocketPrice"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { useSelectedNewsStore } from "@/store/useSelectedNewsStore"
import { MarketService } from "@/services/market.service"

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  summary?: string;
  fullText: string;
  url: string;
}

const Dashboard = () => {
  const { selectedSymbol, setSelectedSymbol } = useSymbolStore()
  const { user } = useAuthStore()
  const { pendingNewsId, clearPendingNewsId } = useSelectedNewsStore()
  
  const isVIP = user?.isVip ?? false
  
  const { price } = useWebSocketPrice(selectedSymbol)
  useDocumentTitle(price, selectedSymbol)
  
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [timeframe, setTimeframe] = useState<Timeframe>("1h")
  
  // State for news detail panel triggered by chart marker click
  const [markerNews, setMarkerNews] = useState<NewsItem | null>(null)

  // Watch for pendingNewsId from chart marker clicks and fetch the news
  useEffect(() => {
    const fetchNews = async () => {
      if (!pendingNewsId) return;
      
      try {
        const marketService = MarketService.getInstance();
        const response = await marketService.getNews(100, 1);
        if (response.success && response.data) {
          const foundNews = response.data.news.find(n => n.id.toString() === pendingNewsId);
          if (foundNews) {
            setMarkerNews({
              id: foundNews.id.toString(),
              title: foundNews.title,
              source: foundNews.source,
              timestamp: new Date(foundNews.publishTime),
              summary: foundNews.summary,
              fullText: foundNews.fullText,
              url: foundNews.url,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        clearPendingNewsId();
      }
    };
    
    fetchNews();
  }, [pendingNewsId, clearPendingNewsId]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header
        onPairChange={(pair) => setSelectedSymbol(pair)}
        isVIP={isVIP}
        isPanelOpen={isPanelOpen}
        onPanelToggle={() => setIsPanelOpen(!isPanelOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-card overflow-hidden">
          <CandlestickChart
            pair={selectedSymbol as TradingPair}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        <RightPanel pair={selectedSymbol as TradingPair} isVIP={isVIP} isOpen={isPanelOpen} />
      </div>

      {/* News Detail Panel triggered by chart marker clicks */}
      <NewsDetailPanel
        news={markerNews}
        isOpen={!!markerNews}
        onClose={() => setMarkerNews(null)}
      />
    </div>
  )
}

export default Dashboard

