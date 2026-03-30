import { TrendType } from "../types";

export function detectContinuation(
  currentPrice: number,
  maShort: number,
  maLong: number,
  rsi: number,
  trend: TrendType,
  market: "idx" | "crypto" = "idx"
): "BUY_CONTINUATION" | "SELL_CONTINUATION" | "NONE" {
  // Strong uptrend: MA20 jauh di atas MA50 (misal > 2% gap untuk idx, > 0% untuk crypto)
  const isStrongUptrend = trend === "uptrend" && (market === "crypto" ? maShort > maLong : (maShort - maLong) / maLong > 0.02);
  // Harga tidak pullback ke MA20 (masih kuat di atas MA20, misal > 1.5% di atas MA20)
  // For crypto, relax this so we just need to be above MA20.
  const noPullbackBuy = market === "crypto" ? currentPrice > maShort : currentPrice > maShort * 1.015;
  const validRsiBuy = market === "crypto" ? rsi >= 45 && rsi <= 65 : rsi >= 60 && rsi <= 70;

  if (isStrongUptrend && validRsiBuy && noPullbackBuy) {
    return "BUY_CONTINUATION";
  }

  // Strong downtrend: MA50 jauh di atas MA20
  const isStrongDowntrend = trend === "downtrend" && (market === "crypto" ? maLong > maShort : (maLong - maShort) / maLong > 0.02);
  // Harga tidak pullback ke MA20 (masih kuat di bawah MA20)
  const noPullbackSell = market === "crypto" ? currentPrice < maShort : currentPrice < maShort * 0.985;
  const validRsiSell = market === "crypto" ? rsi <= 55 && rsi >= 35 : rsi <= 40 && rsi >= 30;

  if (isStrongDowntrend && validRsiSell && noPullbackSell) {
    return "SELL_CONTINUATION";
  }

  return "NONE";
}
