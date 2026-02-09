import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  ColorType, 
  CandlestickSeries,
  LineSeries,
  createSeriesMarkers,
  type IChartApi, 
  type ISeriesApi, 
  type UTCTimestamp,
  type CandlestickData,
  type SeriesMarker,
  type Time,
  type ISeriesMarkersPluginApi
} from 'lightweight-charts';
import { MarketService } from '@/services/market.service';
import type { TimeInterval, NewsData } from '@/services/market.service';
import { useChartResize } from '@/hooks/useChartResize';
import { useWebSocketPrice } from '@/hooks/useWebSocketPrice';
import { calculateSMA, calculateEMA } from '@/lib/indicators';

const INTERVAL_MS: Record<TimeInterval, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

export interface IndicatorConfig {
  sma?: { enabled: boolean; period: number };
  ema?: { enabled: boolean; period: number };
}

interface TradingChartProps {
  symbol: string;
  interval: TimeInterval;
  className?: string;
  height?: number | string;
  indicators?: IndicatorConfig;
  showNewsMarkers?: boolean;
  onNewsMarkerClick?: (newsItems: Array<{ id: number; title: string }>) => void;
}

interface ChartDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function TradingChart({
  symbol,
  interval,
  className = "",
  indicators = { sma: { enabled: false, period: 20 }, ema: { enabled: false, period: 12 } },
  showNewsMarkers = false,
  onNewsMarkerClick
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const lastCandleRef = useRef<ChartDataPoint | null>(null);
  const chartDataRef = useRef<ChartDataPoint[]>([]);
  const newsDataRef = useRef<NewsData[]>([]);
  
  // Track chart initialization state to prevent race conditions
  const [chartReady, setChartReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<{ open: number; high: number; low: number; close: number } | null>(null);
  const [indicatorValues, setIndicatorValues] = useState<{ sma: number | null; ema: number | null }>({ sma: null, ema: null });

  const { price } = useWebSocketPrice(symbol);

  useChartResize(chartContainerRef, chartRef);

  // Update indicator series data
  const updateIndicators = useCallback((data: ChartDataPoint[]) => {
    if (!chartRef.current) return;

    const closePrices = data.map(d => d.close);
    const timestamps = data.map(d => d.time);

    // Update SMA
    if (indicators.sma?.enabled && smaSeriesRef.current) {
      const smaValues = calculateSMA(closePrices, indicators.sma.period);
      const smaData = timestamps
        .map((time, i) => ({ time, value: smaValues[i] }))
        .filter(d => d.value !== null) as { time: UTCTimestamp; value: number }[];
      smaSeriesRef.current.setData(smaData);
    }

    // Update EMA
    if (indicators.ema?.enabled && emaSeriesRef.current) {
      const emaValues = calculateEMA(closePrices, indicators.ema.period);
      const emaData = timestamps
        .map((time, i) => ({ time, value: emaValues[i] }))
        .filter(d => d.value !== null) as { time: UTCTimestamp; value: number }[];
      emaSeriesRef.current.setData(emaData);
    }
  }, [indicators]);

  // Update news markers on chart using plugin API (lightweight-charts v5)
  // Groups news by candle time to show ONE marker per candle
  const updateNewsMarkers = useCallback((data: ChartDataPoint[], news: NewsData[]) => {
    if (!markersPluginRef.current) return;
    
    if (!showNewsMarkers || news.length === 0 || data.length === 0) {
      markersPluginRef.current.setMarkers([]);
      return;
    }

    const chartStartTime = data[0]?.time;
    const chartEndTime = data[data.length - 1]?.time;
    
    if (!chartStartTime || !chartEndTime) return;

    // Group news by closest candle time
    const newsGroupedByCandle = new Map<number, NewsData[]>();
    
    news.forEach(n => {
      const newsTime = new Date(n.publishTime).getTime() / 1000;
      if (newsTime < chartStartTime || newsTime > chartEndTime) return;
      
      // Find closest candle time
      const closestCandle = data.reduce((prev, curr) => {
        return Math.abs(curr.time - newsTime) < Math.abs(prev.time - newsTime) ? curr : prev;
      });
      
      const candleTime = closestCandle.time as number;
      if (!newsGroupedByCandle.has(candleTime)) {
        newsGroupedByCandle.set(candleTime, []);
      }
      newsGroupedByCandle.get(candleTime)!.push(n);
    });

    // Create ONE marker per candle with news count
    const markers: SeriesMarker<Time>[] = Array.from(newsGroupedByCandle.entries()).map(([candleTime, newsItems]) => {
      const count = newsItems.length;
      return {
        time: candleTime as Time,
        position: 'aboveBar' as const,
        color: '#3b82f6', // Blue-500 - more professional
        shape: 'arrowDown' as const, // Arrow pointing to the candle
        text: count > 1 ? `📰${count}` : '📰',
        size: 1, // Larger size
        id: `news-${candleTime}`,
      };
    });

    markersPluginRef.current.setMarkers(markers);
  }, [showNewsMarkers]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          });
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString('vi-VN', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit'
          });
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
        autoScale: true,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#eab308',
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
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Create markers plugin for news markers (v5 API)
    const markersPlugin = createSeriesMarkers(candlestickSeries, []);
    markersPluginRef.current = markersPlugin;

    // Add SMA line series
    const smaSeries = chart.addSeries(LineSeries, {
      color: '#2196F3',
      lineWidth: 2,
      title: `SMA ${indicators.sma?.period || 20}`,
      visible: indicators.sma?.enabled ?? false,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    smaSeriesRef.current = smaSeries;

    // Add EMA line series
    const emaSeries = chart.addSeries(LineSeries, {
      color: '#FF9800',
      lineWidth: 2,
      title: `EMA ${indicators.ema?.period || 12}`,
      visible: indicators.ema?.enabled ?? false,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    emaSeriesRef.current = emaSeries;

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
        setIndicatorValues({ sma: null, ema: null });
      } else {
        const candleData = param.seriesData.get(candlestickSeries);
        if (candleData) {
          const candle = candleData as CandlestickData;
          setCurrentPrice({
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          });
        }

        // Get indicator values at crosshair position
        const smaData = param.seriesData.get(smaSeries);
        const emaData = param.seriesData.get(emaSeries);
        setIndicatorValues({
          sma: smaData ? (smaData as { value: number }).value : null,
          ema: emaData ? (emaData as { value: number }).value : null,
        });
      }
    });

    // Handle chart clicks for news markers
    chart.subscribeClick((param) => {
      if (!param.time || !onNewsMarkerClick) return;
      
      // Find ALL news items that map to this candle time
      const clickedNewsItems = newsDataRef.current.filter(n => {
        const newsTime = Math.floor(new Date(n.publishTime).getTime() / 1000);
        const chartData = chartDataRef.current;
        if (chartData.length === 0) return false;
        const closestCandle = chartData.reduce((prev, curr) => {
          return Math.abs(curr.time - newsTime) < Math.abs(prev.time - newsTime) ? curr : prev;
        }, chartData[0]);
        return closestCandle && closestCandle.time === param.time;
      });

      if (clickedNewsItems.length > 0) {
        onNewsMarkerClick(clickedNewsItems.map(n => ({ id: n.id, title: n.title })));
      }
    });

    // Mark chart as ready after full initialization
    setChartReady(true);

    return () => {
      setChartReady(false);
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
      markersPluginRef.current = null;
    };
  }, []);

  // Update indicator visibility when config changes
  useEffect(() => {
    if (smaSeriesRef.current) {
      smaSeriesRef.current.applyOptions({ 
        visible: indicators.sma?.enabled ?? false,
        title: `SMA ${indicators.sma?.period || 20}`
      });
    }
    if (emaSeriesRef.current) {
      emaSeriesRef.current.applyOptions({ 
        visible: indicators.ema?.enabled ?? false,
        title: `EMA ${indicators.ema?.period || 12}`
      });
    }
    
    // Recalculate indicators if data exists
    if (chartDataRef.current.length > 0) {
      updateIndicators(chartDataRef.current);
    }
  }, [indicators, updateIndicators]);

  // Load Data - only when chart is ready
  useEffect(() => {
    // Wait for chart to be fully initialized
    if (!chartReady) return;
    
    let isMounted = true;
    
    // Reset last candle ref when interval changes to prevent stale data
    lastCandleRef.current = null;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const marketService = MarketService.getInstance();
        
        // Load OHLCV data
        const response = await marketService.getHistoryWithFallback({
          symbol,
          interval,
          limit: 1000
        });

        // Check if component is still mounted and chart is still valid
        if (!isMounted || !candlestickSeriesRef.current) return;

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

            const uniqueData = formattedData.filter((v, i, a) => a.findIndex(t => (t.time === v.time)) === i);
            
            // Double check refs are still valid before updating
            if (!isMounted || !candlestickSeriesRef.current) return;
            
            chartDataRef.current = uniqueData;
            candlestickSeriesRef.current.setData(uniqueData);
            chartRef.current?.timeScale().fitContent();
            
            // Update indicators
            updateIndicators(uniqueData);

            // Load news for markers
            if (showNewsMarkers && isMounted) {
              try {
                const newsResponse = await marketService.getNews(100, 1);
                if (isMounted && newsResponse.success && newsResponse.data) {
                  newsDataRef.current = newsResponse.data.news;
                  updateNewsMarkers(uniqueData, newsResponse.data.news);
                }
              } catch (newsErr) {
                console.warn('Failed to load news for markers:', newsErr);
                // Don't fail the chart if news fails
              }
            }
          }
        } else {
          if (isMounted) {
            setError(response.message || 'Failed to load chart data');
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to load chart data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [symbol, interval, showNewsMarkers, chartReady, updateIndicators, updateNewsMarkers]);

  // Handle real-time price updates
  useEffect(() => {
    if (!price || !candlestickSeriesRef.current) return;

    const intervalMs = INTERVAL_MS[interval];
    const now = Date.now();
    const candleTime = Math.floor(now / intervalMs) * intervalMs / 1000;

    if (!lastCandleRef.current || lastCandleRef.current.time !== candleTime) {
      lastCandleRef.current = {
        time: candleTime as UTCTimestamp,
        open: price,
        high: price,
        low: price,
        close: price,
      };
    } else {
      lastCandleRef.current = {
        ...lastCandleRef.current,
        high: Math.max(lastCandleRef.current.high, price),
        low: Math.min(lastCandleRef.current.low, price),
        close: price,
      };
    }

    candlestickSeriesRef.current.update(lastCandleRef.current);
  }, [price, interval]);

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
        <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
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
          {/* Indicator values */}
          {indicators.sma?.enabled && indicatorValues.sma !== null && (
            <div className="flex gap-1">
              <span className="text-[#2196F3]">SMA{indicators.sma.period}:</span>
              <span className="text-[#2196F3]">{indicatorValues.sma.toFixed(2)}</span>
            </div>
          )}
          {indicators.ema?.enabled && indicatorValues.ema !== null && (
            <div className="flex gap-1">
              <span className="text-[#FF9800]">EMA{indicators.ema.period}:</span>
              <span className="text-[#FF9800]">{indicatorValues.ema.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
