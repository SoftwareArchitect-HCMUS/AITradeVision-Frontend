/**
 * Technical Indicator Calculation Utilities
 * Used for calculating MA, EMA and other technical indicators for trading charts
 */

export interface IndicatorDataPoint {
  time: number; // UTC timestamp in seconds
  value: number | null;
}

/**
 * Calculate Simple Moving Average (SMA)
 * SMA = (Sum of closing prices over N periods) / N
 * 
 * @param closePrices - Array of closing prices
 * @param period - Number of periods for the average (e.g., 20 for SMA20)
 * @returns Array of SMA values (null for periods where calculation is not possible)
 */
export function calculateSMA(closePrices: number[], period: number): (number | null)[] {
  if (period <= 0 || closePrices.length === 0) {
    return [];
  }

  const result: (number | null)[] = [];
  
  for (let i = 0; i < closePrices.length; i++) {
    if (i < period - 1) {
      // Not enough data points yet
      result.push(null);
    } else {
      // Calculate sum of last 'period' prices
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += closePrices[i - j];
      }
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * EMA = (Close - Previous EMA) × Multiplier + Previous EMA
 * Multiplier = 2 / (period + 1)
 * 
 * @param closePrices - Array of closing prices
 * @param period - Number of periods for the EMA (e.g., 12 for EMA12)
 * @returns Array of EMA values (null for periods where calculation is not possible)
 */
export function calculateEMA(closePrices: number[], period: number): (number | null)[] {
  if (period <= 0 || closePrices.length === 0) {
    return [];
  }

  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  // First, we need an initial SMA as the seed for EMA
  let ema: number | null = null;
  
  for (let i = 0; i < closePrices.length; i++) {
    if (i < period - 1) {
      // Not enough data points yet
      result.push(null);
    } else if (i === period - 1) {
      // Use SMA for the first EMA value
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += closePrices[i - j];
      }
      ema = sum / period;
      result.push(ema);
    } else {
      // Calculate EMA: (Close - Previous EMA) × Multiplier + Previous EMA
      ema = (closePrices[i] - ema!) * multiplier + ema!;
      result.push(ema);
    }
  }
  
  return result;
}

/**
 * Format indicator data for lightweight-charts LineSeries
 * 
 * @param timestamps - Array of timestamps (in seconds, UTC)
 * @param values - Array of indicator values (may contain nulls)
 * @returns Array of data points suitable for LineSeries.setData()
 */
export function formatIndicatorData(
  timestamps: number[], 
  values: (number | null)[]
): IndicatorDataPoint[] {
  const result: IndicatorDataPoint[] = [];
  
  for (let i = 0; i < timestamps.length && i < values.length; i++) {
    if (values[i] !== null) {
      result.push({
        time: timestamps[i],
        value: values[i],
      });
    }
  }
  
  return result;
}

/**
 * Indicator configuration presets
 */
export const INDICATOR_PRESETS = {
  SMA: {
    short: { period: 10, color: '#2196F3', name: 'SMA 10' },
    medium: { period: 20, color: '#2196F3', name: 'SMA 20' },
    long: { period: 50, color: '#1976D2', name: 'SMA 50' },
  },
  EMA: {
    short: { period: 12, color: '#FF9800', name: 'EMA 12' },
    medium: { period: 26, color: '#FF9800', name: 'EMA 26' },
    long: { period: 50, color: '#F57C00', name: 'EMA 50' },
  },
} as const;
