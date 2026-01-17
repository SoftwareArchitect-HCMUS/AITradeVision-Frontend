import { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  CandlestickSeries,
  type IChartApi, 
  type ISeriesApi, 
  type UTCTimestamp,
  type CandlestickData
} from 'lightweight-charts';
import { MarketService } from '@/services/market.service';
import type { TimeInterval } from '@/services/market.service';
import { useChartResize } from '@/hooks/useChartResize';

interface TradingChartProps {
  symbol: string;
  interval: TimeInterval;
  className?: string;
  // height is now handled responsively by the container, but we keep the prop for compatibility if needed
  height?: number | string;
}

export function TradingChart({
  symbol,
  interval,
  className = ""
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<{ open: number; high: number; low: number; close: number } | null>(null);

  // Handle responsive resizing
  useChartResize(chartContainerRef, chartRef);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af', // text-muted-foreground
      },
      grid: {
        vertLines: { color: '#334155' }, // slate-700/50
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
        autoScale: true,
      },
      crosshair: {
        mode: 1, // Magnet mode
        vertLine: {
          width: 1,
          color: '#eab308', // yellow-500
          style: 0,
          labelBackgroundColor: '#eab308',
        },
        horzLine: {
          width: 1,
          color: '#eab308',
          style: 0,
          labelBackgroundColor: '#eab308',
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e', // green-500
      downColor: '#ef4444', // red-500
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Optional: Add volume series later if needed
    // const volumeSeries = chart.addHistogramSeries({...});

    // Subscribe to crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current!.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current!.clientHeight
      ) {
        setCurrentPrice(null);
      } else {
        const data = param.seriesData.get(candlestickSeries);
        if (data) {
          const candle = data as CandlestickData;
          setCurrentPrice({
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          });
        }
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const marketService = MarketService.getInstance();
        const response = await marketService.getHistoryWithFallback({
          symbol,
          interval,
          limit: 1000 // Increase limit for better zoom capability
        });

        if (response.success && response.data) {
          if (response.data.length === 0) {
            setError('No historical data available');
          } else {
            const formattedData = response.data
              .filter(item => typeof item.timestamp === 'number' && !isNaN(item.timestamp))
              .map(item => ({
                time: (item.timestamp / 1000) as UTCTimestamp,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
              }))
              .sort((a, b) => (a.time as number) - (b.time as number));

            // Remove duplicates base on time
            const uniqueData = formattedData.filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);

            candlestickSeriesRef.current?.setData(uniqueData);
            chartRef.current?.timeScale().fitContent();
          }
        } else {
          setError(response.message || 'Failed to load chart data');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    if (candlestickSeriesRef.current) {
      loadData();
    }
  }, [symbol, interval]);

  return (
    <div className={`relative w-full h-full ${className} select-none`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Floating Tooltip / Legend */}
      <div className="absolute top-2 left-3 z-10 hidden sm:block pointer-events-none">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="font-bold text-foreground">{symbol}</div>
          {currentPrice ? (
            <>
              <div className="flex gap-1"><span className="text-muted-foreground">O:</span><span className={currentPrice.open > currentPrice.close ? 'text-red-500' : 'text-green-500'}>{currentPrice.open.toFixed(2)}</span></div>
              <div className="flex gap-1"><span className="text-muted-foreground">H:</span><span className={currentPrice.open > currentPrice.close ? 'text-red-500' : 'text-green-500'}>{currentPrice.high.toFixed(2)}</span></div>
              <div className="flex gap-1"><span className="text-muted-foreground">L:</span><span className={currentPrice.open > currentPrice.close ? 'text-red-500' : 'text-green-500'}>{currentPrice.low.toFixed(2)}</span></div>
              <div className="flex gap-1"><span className="text-muted-foreground">C:</span><span className={currentPrice.open > currentPrice.close ? 'text-red-500' : 'text-green-500'}>{currentPrice.close.toFixed(2)}</span></div>
            </>
          ) : (
            <span className="text-muted-foreground opacity-50">OHLC</span>
          )}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
