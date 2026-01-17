export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RealtimePriceData {
  symbol: string;
  price: number;
  timestamp: number;
  volume24h?: number;
  change24h?: number;
}

export type TimeInterval = '1s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface MarketHistoryQuery {
  symbol: string;
  interval: TimeInterval;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export interface MarketResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class MarketService {
  private static instance: MarketService;

  private constructor() {}

  static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  async getHistory(query: MarketHistoryQuery): Promise<MarketResponse<OHLCVData[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData = this.generateMockOHLCVData(query);
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Failed to fetch market history'
      };
    }
  }

  async getRealtimePrice(symbol: string): Promise<MarketResponse<RealtimePriceData>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const mockData = this.generateMockRealtimePrice(symbol);
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      return {
        success: false,
        data: {} as RealtimePriceData,
        message: 'Failed to fetch real-time price'
      };
    }
  }

  private generateMockOHLCVData(query: MarketHistoryQuery): OHLCVData[] {
    const { symbol, interval, limit = 100 } = query;
    const data: OHLCVData[] = [];

    let currentPrice = this.getBasePrice(symbol);
    const now = Date.now();

    const intervalMs = this.getIntervalMs(interval);

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);

      const volatility = currentPrice * 0.02;
      const open = currentPrice + (Math.random() - 0.5) * volatility;

      const change = (Math.random() - 0.5) * volatility * 2;
      const close = open + change;

      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;

      const volume = Math.random() * 1000 + 100;

      data.push({
        timestamp,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.round(volume * 100) / 100
      });

      currentPrice = close;
    }

    return data;
  }

  private generateMockRealtimePrice(symbol: string): RealtimePriceData {
    const basePrice = this.getBasePrice(symbol);
    const change = (Math.random() - 0.5) * basePrice * 0.05;
    const price = basePrice + change;

    return {
      symbol,
      price: Math.round(price * 100) / 100,
      timestamp: Date.now(),
      volume24h: Math.round((Math.random() * 1000000 + 100000) * 100) / 100,
      change24h: Math.round((change / basePrice * 100) * 100) / 100
    };
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'BTCUSDT': 50000,
      'ETHUSDT': 3000,
      'SOLUSDT': 100
    };
    return prices[symbol] || 1000;
  }

  private getIntervalMs(interval: TimeInterval): number {
    const intervals: Record<TimeInterval, number> = {
      '1s': 1000,
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '1h': 3600000,
      '4h': 14400000,
      '1d': 86400000
    };
    return intervals[interval] || 60000;
  }
}
