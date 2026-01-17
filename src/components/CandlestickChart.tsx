import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";
import { type TradingPair, type Timeframe } from "@/types/trading";
import { TradingChart } from "./TradingChart";
import { useWebSocketPrice } from "@/hooks/useWebSocketPrice";
import type { TimeInterval } from "@/services/market.service";

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
  
  // Use WebSocket for real-time price instead of polling
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

  return (
    <div className="flex flex-col h-full">
      <div ref={headerRef} className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-4">
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
        <div className="flex space-x-2">
          {(["1m", "5m", "1h", "1d"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 border rounded ${
                timeframe === tf ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <TradingChart
          symbol={pair}
          interval={timeframeToInterval[timeframe]}
          height={chartHeight}
        />
      </div>
    </div>
  );
}
