import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type TradingPair, type Timeframe } from "@/types/trading";

const candlestickData = {
  "BTC/USDT": [
    { date: "2024-01-01", timestamp: 1704067200000, open: 42000, high: 45000, low: 41000, close: 44000, volume: 1000000 },
    { date: "2024-01-02", timestamp: 1704153600000, open: 44000, high: 46000, low: 43500, close: 45500, volume: 1200000 },
    { date: "2024-01-03", timestamp: 1704240000000, open: 45500, high: 47000, low: 45000, close: 46500, volume: 1100000 },
    { date: "2024-01-04", timestamp: 1704326400000, open: 46500, high: 48000, low: 46000, close: 47500, volume: 1300000 },
    { date: "2024-01-05", timestamp: 1704412800000, open: 47500, high: 48500, low: 47000, close: 48000, volume: 1250000 },
    { date: "2024-01-06", timestamp: 1704499200000, open: 48000, high: 49000, low: 47500, close: 48500, volume: 1400000 },
    { date: "2024-01-07", timestamp: 1704585600000, open: 48500, high: 49500, low: 48000, close: 49000, volume: 1350000 },
    { date: "2024-01-08", timestamp: 1704672000000, open: 49000, high: 50000, low: 48500, close: 49500, volume: 1450000 },
    { date: "2024-01-09", timestamp: 1704758400000, open: 49500, high: 50500, low: 49000, close: 50000, volume: 1500000 },
    { date: "2024-01-10", timestamp: 1704844800000, open: 50000, high: 51000, low: 49500, close: 50500, volume: 1600000 },
    { date: "2024-01-11", timestamp: 1704931200000, open: 50500, high: 51500, low: 50000, close: 51000, volume: 1550000 },
    { date: "2024-01-12", timestamp: 1705017600000, open: 51000, high: 52000, low: 50500, close: 51500, volume: 1650000 },
    { date: "2024-01-13", timestamp: 1705104000000, open: 51500, high: 52500, low: 51000, close: 52000, volume: 1700000 },
    { date: "2024-01-14", timestamp: 1705190400000, open: 52000, high: 53000, low: 51500, close: 52500, volume: 1750000 },
    { date: "2024-01-15", timestamp: 1705276800000, open: 52500, high: 53500, low: 52000, close: 53000, volume: 1800000 },
  ],
  "ETH/USDT": [
    { date: "2024-01-01", timestamp: 1704067200000, open: 2200, high: 2400, low: 2100, close: 2350, volume: 200000 },
    { date: "2024-01-02", timestamp: 1704153600000, open: 2350, high: 2500, low: 2300, close: 2450, volume: 220000 },
    { date: "2024-01-03", timestamp: 1704240000000, open: 2450, high: 2600, low: 2400, close: 2550, volume: 210000 },
    { date: "2024-01-04", timestamp: 1704326400000, open: 2550, high: 2700, low: 2500, close: 2650, volume: 230000 },
    { date: "2024-01-05", timestamp: 1704412800000, open: 2650, high: 2750, low: 2600, close: 2700, volume: 225000 },
    { date: "2024-01-06", timestamp: 1704499200000, open: 2700, high: 2800, low: 2650, close: 2750, volume: 240000 },
    { date: "2024-01-07", timestamp: 1704585600000, open: 2750, high: 2850, low: 2700, close: 2800, volume: 235000 },
    { date: "2024-01-08", timestamp: 1704672000000, open: 2800, high: 2900, low: 2750, close: 2850, volume: 245000 },
    { date: "2024-01-09", timestamp: 1704758400000, open: 2850, high: 2950, low: 2800, close: 2900, volume: 250000 },
    { date: "2024-01-10", timestamp: 1704844800000, open: 2900, high: 3000, low: 2850, close: 2950, volume: 260000 },
    { date: "2024-01-11", timestamp: 1704931200000, open: 2950, high: 3050, low: 2900, close: 3000, volume: 255000 },
    { date: "2024-01-12", timestamp: 1705017600000, open: 3000, high: 3100, low: 2950, close: 3050, volume: 265000 },
    { date: "2024-01-13", timestamp: 1705104000000, open: 3050, high: 3150, low: 3000, close: 3100, volume: 270000 },
    { date: "2024-01-14", timestamp: 1705190400000, open: 3100, high: 3200, low: 3050, close: 3150, volume: 275000 },
    { date: "2024-01-15", timestamp: 1705276800000, open: 3150, high: 3250, low: 3100, close: 3200, volume: 280000 },
  ],
  "SOL/USDT": [
    { date: "2024-01-01", timestamp: 1704067200000, open: 90, high: 110, low: 85, close: 105, volume: 50000 },
    { date: "2024-01-02", timestamp: 1704153600000, open: 105, high: 125, low: 100, close: 120, volume: 55000 },
    { date: "2024-01-03", timestamp: 1704240000000, open: 120, high: 140, low: 115, close: 135, volume: 52000 },
    { date: "2024-01-04", timestamp: 1704326400000, open: 135, high: 150, low: 130, close: 145, volume: 58000 },
    { date: "2024-01-05", timestamp: 1704412800000, open: 145, high: 155, low: 140, close: 150, volume: 56000 },
    { date: "2024-01-06", timestamp: 1704499200000, open: 150, high: 160, low: 145, close: 155, volume: 60000 },
    { date: "2024-01-07", timestamp: 1704585600000, open: 155, high: 165, low: 150, close: 160, volume: 58000 },
    { date: "2024-01-08", timestamp: 1704672000000, open: 160, high: 170, low: 155, close: 165, volume: 62000 },
    { date: "2024-01-09", timestamp: 1704758400000, open: 165, high: 175, low: 160, close: 170, volume: 65000 },
    { date: "2024-01-10", timestamp: 1704844800000, open: 170, high: 180, low: 165, close: 175, volume: 68000 },
    { date: "2024-01-11", timestamp: 1704931200000, open: 175, high: 185, low: 170, close: 180, volume: 66000 },
    { date: "2024-01-12", timestamp: 1705017600000, open: 180, high: 190, low: 175, close: 185, volume: 70000 },
    { date: "2024-01-13", timestamp: 1705104000000, open: 185, high: 195, low: 180, close: 190, volume: 72000 },
    { date: "2024-01-14", timestamp: 1705190400000, open: 190, high: 200, low: 185, close: 195, volume: 74000 },
    { date: "2024-01-15", timestamp: 1705276800000, open: 195, high: 205, low: 190, close: 200, volume: 76000 },
  ],
};

interface CandleData {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bodyBottom: number;
  bodyHeight: number;
  wickLow: number;
  wickHigh: number;
  isBullish: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as CandleData;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-2">{data.date}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Open:</span>
          <span className="text-foreground font-mono">${data.open.toLocaleString()}</span>
          <span className="text-muted-foreground">High:</span>
          <span className="text-primary font-mono">${data.high.toLocaleString()}</span>
          <span className="text-muted-foreground">Low:</span>
          <span className="text-destructive font-mono">${data.low.toLocaleString()}</span>
          <span className="text-muted-foreground">Close:</span>
          <span className={`font-mono ${data.isBullish ? "text-primary" : "text-destructive"}`}>
            ${data.close.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface CandlestickChartProps {
  pair: TradingPair;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

export function CandlestickChart({ pair, timeframe, onTimeframeChange }: CandlestickChartProps) {
  const rawData = candlestickData[pair];

  const chartData: CandleData[] = useMemo(() => {
    const dataPoints =
      timeframe === "1H"
        ? rawData.slice(-6)
        : timeframe === "4H"
        ? rawData.slice(-10)
        : timeframe === "1D"
        ? rawData.slice(-15)
        : rawData;

    return dataPoints.map((d) => ({
      ...d,
      bodyBottom: Math.min(d.open, d.close),
      bodyHeight: Math.abs(d.close - d.open),
      wickLow: d.low,
      wickHigh: d.high,
      isBullish: d.close >= d.open,
    }));
  }, [rawData, timeframe]);

  const latestCandle = chartData[chartData.length - 1];
  const previousCandle = chartData[chartData.length - 2];
  const priceChange = latestCandle.close - previousCandle.close;
  const priceChangePercent = ((priceChange / previousCandle.close) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const minPrice = Math.min(...chartData.map((d) => d.low)) * 0.998;
  const maxPrice = Math.max(...chartData.map((d) => d.high)) * 1.002;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{pair}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-mono">
                ${latestCandle.close.toLocaleString()}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded ${
                  isPositive
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive"
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

      <div className="flex-1 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              orientation="right"
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={latestCandle.close}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />

            <Bar dataKey="bodyHeight" stackId="candle" barSize={8}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`body-${index}`}
                  fill={entry.isBullish ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                  y={entry.bodyBottom}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
