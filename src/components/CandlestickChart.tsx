import { useEffect, useState, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Wifi, WifiOff, LineChart, Newspaper, Settings2 } from "lucide-react";
import { type TradingPair, type Timeframe } from "@/types/trading";
import { TradingChart, type IndicatorConfig } from "./TradingChart";
import { useWebSocketPrice } from "@/hooks/useWebSocketPrice";
import type { TimeInterval } from "@/services/market.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSelectedNewsStore } from "@/store/useSelectedNewsStore";

interface CandlestickChartProps {
  pair: TradingPair;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

const timeframeToInterval: Record<Timeframe, TimeInterval> = {
  "1m": "1m",
  "5m": "5m",
  "1h": "1h",
  "1d": "1d",
};

export function CandlestickChart({ pair, timeframe, onTimeframeChange }: CandlestickChartProps) {
  const [chartHeight, setChartHeight] = useState<number>(400);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Indicator settings
  const [indicators, setIndicators] = useState<IndicatorConfig>({
    sma: { enabled: false, period: 20 },
    ema: { enabled: false, period: 12 },
  });
  const [showNewsMarkers, setShowNewsMarkers] = useState(false);
  
  // State for news selection dialog (when multiple news at one marker)
  const [pendingNewsItems, setPendingNewsItems] = useState<Array<{ id: number; title: string }>>([]);
  
  // Store for opening news detail panel
  const { selectNewsById } = useSelectedNewsStore();
  
  const { price, priceChange, isConnected } = useWebSocketPrice(pair);

  const isPositive = (priceChange ?? 0) >= 0;
  const priceChangePercent = priceChange !== null ? Math.abs(priceChange).toFixed(2) : "0.00";

  useEffect(() => {
    const calculateChartHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight || 48;
      const availableHeight = window.innerHeight - headerHeight - 60;
      setChartHeight(Math.max(availableHeight, 300));
    };

    calculateChartHeight();
    window.addEventListener('resize', calculateChartHeight);

    return () => window.removeEventListener('resize', calculateChartHeight);
  }, []);

  // When user clicks on a news marker
  const handleNewsMarkerClick = useCallback((newsItems: Array<{ id: number; title: string }>) => {
    if (newsItems.length === 0) return;
    
    if (newsItems.length === 1) {
      // Only one news item, open it directly
      selectNewsById(newsItems[0].id.toString());
    } else {
      // Multiple news items, show selection dialog
      setPendingNewsItems(newsItems);
    }
  }, [selectNewsById]);

  // Handle selecting a news item from the dialog
  const handleSelectNews = (newsId: number) => {
    selectNewsById(newsId.toString());
    setPendingNewsItems([]);
  };

  const toggleSMA = () => {
    setIndicators(prev => ({
      ...prev,
      sma: { ...prev.sma!, enabled: !prev.sma?.enabled }
    }));
  };

  const toggleEMA = () => {
    setIndicators(prev => ({
      ...prev,
      ema: { ...prev.ema!, enabled: !prev.ema?.enabled }
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={headerRef} className="flex items-center justify-between p-3 border-b border-border flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-2xl font-bold">{pair}</h2>
          <span className="text-xl font-mono">
            ${price ? price.toLocaleString() : "---"}
          </span>
          {price && (
            <span
              className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded ${
                isPositive
                  ? "bg-bullish/20 text-bullish"
                  : "bg-bearish/20 text-bearish"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {priceChangePercent}%
            </span>
          )}
          {/* WebSocket connection indicator */}
          <span
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
              isConnected
                ? "bg-bullish/10 text-bullish"
                : "bg-bearish/10 text-bearish"
            }`}
            title={isConnected ? "Real-time connected" : "Reconnecting..."}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicator Controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-1 ${(indicators.sma?.enabled || indicators.ema?.enabled) ? 'border-primary text-primary' : ''}`}
              >
                <LineChart className="h-4 w-4" />
                <span className="hidden sm:inline">Indicators</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Technical Indicators
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={indicators.sma?.enabled}
                onCheckedChange={toggleSMA}
              >
                <span className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#2196F3] rounded" />
                  SMA ({indicators.sma?.period})
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={indicators.ema?.enabled}
                onCheckedChange={toggleEMA}
              >
                <span className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#FF9800] rounded" />
                  EMA ({indicators.ema?.period})
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showNewsMarkers}
                onCheckedChange={(checked: boolean) => setShowNewsMarkers(checked)}
              >
                <span className="flex items-center gap-2">
                  <Newspaper className="h-3 w-3" />
                  News Markers
                </span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Timeframe buttons */}
          <div className="flex space-x-1">
            {(["1m", "5m", "1h", "1d"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 border rounded text-sm ${
                  timeframe === tf ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <TradingChart
          key={timeframeToInterval[timeframe]}
          symbol={pair}
          interval={timeframeToInterval[timeframe]}
          height={chartHeight}
          indicators={indicators}
          showNewsMarkers={showNewsMarkers}
          onNewsMarkerClick={handleNewsMarkerClick}
        />
      </div>

      {/* News Selection Dialog - shown when multiple news items at one marker */}
      <Dialog open={pendingNewsItems.length > 0} onOpenChange={() => setPendingNewsItems([])}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              {pendingNewsItems.length} News Events
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 max-h-[400px] overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-3">
              Multiple news events found at this time. Select one to view:
            </p>
            {pendingNewsItems.map((news, index) => (
              <button
                key={news.id}
                onClick={() => handleSelectNews(news.id)}
                className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                  index > 0 ? 'mt-2' : ''
                }`}
              >
                <p className="text-sm text-foreground font-medium">{news.title}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
