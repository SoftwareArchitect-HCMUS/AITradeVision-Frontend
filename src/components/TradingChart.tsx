import { useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import { MarketService } from '@/services/market.service';
import type { TimeInterval } from '@/services/market.service';

interface TradingChartProps {
  symbol: string;
  interval: TimeInterval;
  height?: number;
  className?: string;
}

export function TradingChart({
  symbol,
  interval,
  height = 600,
  className = ""
}: TradingChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const marketService = MarketService.getInstance();
        const response = await marketService.getHistory({
          symbol,
          interval,
          limit: 100
        });

        if (response.success && response.data) {
          const formattedData = response.data.map(item => ({
            x: new Date(item.timestamp),
            y: [item.open, item.high, item.low, item.close]
          }));

          setChartData(formattedData);
        } else {
          setError(response.message || 'Failed to load chart data');
        }
      } catch (err) {
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [symbol, interval]);

  const options = {
    series: [{
      data: chartData
    }],
    chart: {
      type: 'candlestick',
      height: height,
      background: 'hsl(var(--background))',
      foreColor: 'hsl(var(--foreground))',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: true
      }
    },
    title: {
      text: `${symbol} - ${interval.toUpperCase()}`,
      align: 'left',
      style: {
        color: 'hsl(var(--foreground))'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: 'hsl(var(--muted-foreground))'
        }
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: 'hsl(var(--bullish))',
          downward: 'hsl(var(--bearish))'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    grid: {
      borderColor: 'hsl(var(--chart-grid))',
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      x: {
        format: 'dd MMM yyyy HH:mm'
      }
    }
  };

  useEffect(() => {
    if (!chartData.length) return;

    const chartElement = document.querySelector("#trading-chart");
    if (!chartElement) return;

    const chart = new ApexCharts(chartElement, options);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [chartData]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      <div id="trading-chart" className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}
