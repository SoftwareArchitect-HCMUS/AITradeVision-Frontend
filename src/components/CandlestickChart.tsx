import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type TradingPair, type Timeframe } from "@/types/trading";
import { TradingChart } from "./TradingChart";
import { MarketService } from "@/services/market.service";
import type { TimeInterval } from "@/services/market.service";

interface CandlestickChartProps {
  pair: TradingPair;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

const timeframeToInterval: Record<Timeframe, TimeInterval> = {
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
  "1W": "1d",
};

export function CandlestickChart({ pair, timeframe, onTimeframeChange }: CandlestickChartProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<string>("0.00");

  useEffect(() => {
    const fetchRealtimePrice = async () => {
      try {
        const marketService = MarketService.getInstance();
        const response = await marketService.getRealtimePrice(pair);

        if (response.success && response.data) {
          setCurrentPrice(response.data.price);

          if (response.data.change24h !== undefined) {
            setPriceChange(response.data.change24h);
            setPriceChangePercent(Math.abs(response.data.change24h).toFixed(2));
          }
        }
      } catch (error) {
        console.error("Failed to fetch real-time price:", error);
      }
    };

    fetchRealtimePrice();

    const interval = setInterval(fetchRealtimePrice, 5000);

    return () => clearInterval(interval);
  }, [pair]);

  const isPositive = priceChange >= 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{pair}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-mono">
                ${currentPrice ? currentPrice.toLocaleString() : "---"}
              </span>
              {currentPrice && (
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
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {(["1H", "4H", "1D", "1W"] as Timeframe[]).map((tf) => (
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

      <div className="flex-1">
        <TradingChart
          symbol={pair}
          interval={timeframeToInterval[timeframe]}
          height={500}
        />
      </div>
    </div>
  );
}
