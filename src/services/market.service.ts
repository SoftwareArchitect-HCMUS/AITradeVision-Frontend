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

export interface AIInsightData {
  id: number;
  newsId: number;
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  reasoning: string;
  prediction: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  createdAt: string;
}

export interface NewsData {
  id: number;
  title: string;
  summary?: string;
  fullText: string;
  tickers: string[];
  source: string;
  publishTime: string;
  url: string;
  createdAt: string;
}

export interface NewsListResponse {
  news: NewsData[];
  total: number;
  page: number;
  limit: number;
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
      const api = (await import('@/lib/api')).default;
      const params = new URLSearchParams({
        symbol: query.symbol,
        interval: query.interval,
        ...(query.limit && { limit: query.limit.toString() }),
        ...(query.startTime && { startTime: query.startTime }),
        ...(query.endTime && { endTime: query.endTime }),
      });
      const response = await api.get(`/market/history?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch market history'
      };
    }
  }

  async getRealtimePrice(symbol: string): Promise<MarketResponse<RealtimePriceData>> {
    try {
      const api = (await import('@/lib/api')).default;
      const response = await api.get(`/market/realtime?symbol=${symbol}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {} as RealtimePriceData,
        message: error.response?.data?.message || 'Failed to fetch real-time price'
      };
    }
  }

  async getSupportedSymbols(): Promise<MarketResponse<string[]>> {
    try {
      const api = (await import('@/lib/api')).default;
      const response = await api.get('/market/symbols');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch supported symbols'
      };
    }
  }

  async getAIInsights(symbol?: string, limit: number = 10): Promise<MarketResponse<AIInsightData[]>> {
    try {
      const api = (await import('@/lib/api')).default;
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      params.append('limit', limit.toString());

      const response = await api.get(`/ai/insights?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch AI insights'
      };
    }
  }

  async getNews(limit: number = 20, page: number = 1): Promise<MarketResponse<NewsListResponse>> {
    try {
      const api = (await import('@/lib/api')).default;
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString()
      });

      const response = await api.get(`/news/latest?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: { news: [], total: 0, page: 1, limit: 20 },
        message: error.response?.data?.message || 'Failed to fetch news'
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

}
