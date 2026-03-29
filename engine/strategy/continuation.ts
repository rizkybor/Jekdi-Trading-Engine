import { TrendType } from "../types";

export function detectContinuation(
  currentPrice: number,
  maShort: number,
  maLong: number,
  rsi: number,
  trend: TrendType
): "BUY_CONTINUATION" | "SELL_CONTINUATION" | "NONE" {
  // Strong uptrend: MA20 jauh di atas MA50 (misal > 2% gap)
  const isStrongUptrend = trend === "uptrend" && (maShort - maLong) / maLong > 0.02;
  // Harga tidak pullback ke MA20 (masih kuat di atas MA20, misal > 1.5% di atas MA20)
  const noPullbackBuy = currentPrice > maShort * 1.015;

  if (isStrongUptrend && rsi >= 60 && rsi <= 70 && noPullbackBuy) {
    return "BUY_CONTINUATION";
  }

  // Strong downtrend: MA50 jauh di atas MA20
  const isStrongDowntrend = trend === "downtrend" && (maLong - maShort) / maLong > 0.02;
  // Harga tidak pullback ke MA20 (masih kuat di bawah MA20)
  const noPullbackSell = currentPrice < maShort * 0.985;

  if (isStrongDowntrend && rsi <= 40 && rsi >= 30 && noPullbackSell) {
    return "SELL_CONTINUATION";
  }

  return "NONE";
}
