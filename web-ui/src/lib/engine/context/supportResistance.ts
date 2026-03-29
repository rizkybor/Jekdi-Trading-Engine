import { Candle } from "../types";

export interface SupportResistance {
  support: number;
  resistance: number;
}

export function detectSupportResistance(candles: Candle[], lookbackPeriod: number = 20): SupportResistance {
  if (candles.length === 0) return { support: 0, resistance: 0 };
  
  const recentCandles = candles.slice(-lookbackPeriod);
  
  let support = recentCandles[0].low;
  let resistance = recentCandles[0].high;

  for (const candle of recentCandles) {
    if (candle.low < support) support = candle.low;
    if (candle.high > resistance) resistance = candle.high;
  }

  return { support, resistance };
}

export function isNearSupportOrResistance(
  currentPrice: number, 
  levels: SupportResistance, 
  tolerancePercent: number = 0.02
): { nearSupport: boolean; nearResistance: boolean } {
  if (levels.support === 0 || levels.resistance === 0) {
    return { nearSupport: false, nearResistance: false };
  }

  const nearSupport = Math.abs(currentPrice - levels.support) / levels.support <= tolerancePercent;
  const nearResistance = Math.abs(currentPrice - levels.resistance) / levels.resistance <= tolerancePercent;

  return { nearSupport, nearResistance };
}
