import { TrendType } from "../types";

export function detectTrend(maShort: number, maLong: number, currentPrice: number): TrendType {
  if (maShort === 0 || maLong === 0) return "sideways";

  // Tolerance to avoid noise
  const tolerance = maLong * 0.005;

  // Uptrend: MA20 > MA50 + tolerance and Price is above MA50
  if (maShort > maLong + tolerance && currentPrice > maLong) {
    return "uptrend";
  }
  
  // Downtrend: MA20 < MA50 - tolerance and Price is below MA50
  if (maShort < maLong - tolerance && currentPrice < maLong) {
    return "downtrend";
  }

  return "sideways";
}
