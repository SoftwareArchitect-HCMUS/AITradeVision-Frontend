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

export type TimeInterval = '1m' | '5m' | '1h' | '1d';

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

  /**
   * Get history from Binance API with Redis cache (fallback when DB has no data)
   */
  async getHistoryFromBinance(query: MarketHistoryQuery): Promise<MarketResponse<OHLCVData[]>> {
    try {
      const api = (await import('@/lib/api')).default;
      const params = new URLSearchParams({
        symbol: query.symbol,
        interval: query.interval,
        ...(query.limit && { limit: query.limit.toString() }),
        ...(query.startTime && { startTime: query.startTime }),
        ...(query.endTime && { endTime: query.endTime }),
      });
      const response = await api.get(`/market/history/binance?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch market history from Binance'
      };
    }
  }

  /**
   * Get history with automatic fallback to Binance if DB has insufficient data
   */
  async getHistoryWithFallback(query: MarketHistoryQuery): Promise<MarketResponse<OHLCVData[]>> {
    // First try to get from local DB
    const dbResponse = await this.getHistory(query);
    
    // If DB has enough data (at least 50 candles), use it
    if (dbResponse.success && dbResponse.data.length >= 50) {
      return dbResponse;
    }
    
    // Fallback to Binance API
    console.log('[MarketService] DB has insufficient data, falling back to Binance API');
    return this.getHistoryFromBinance(query);
  }

  /**
   * Get latest AI insights across all symbols
   */
  async getLatestAIInsights(limit: number = 20): Promise<MarketResponse<AIInsightData[]>> {
    try {
      const api = (await import('@/lib/api')).default;
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      const response = await api.get(`/ai/insights/latest?${params}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch latest AI insights'
      };
    }
  }

  /**
   * Get AI insights for a specific news article
   */
  async getAIInsightsByNewsId(newsId: number): Promise<MarketResponse<AIInsightData[]>> {
    try {
      const api = (await import('@/lib/api')).default;
      const response = await api.get(`/ai/insights/news/${newsId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch AI insights for news'
      };
    }
  }
}

