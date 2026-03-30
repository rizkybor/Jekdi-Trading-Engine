import { TrendType } from "../types";

export function isTradeFilteredOut(
  volumeContext: string,
  isExtremeVolatility: boolean,
  trend: TrendType,
  market: "idx" | "crypto" = "idx"
): { filtered: boolean; reason?: string } {
  if (market === "crypto") {
    // 5. NO TRADE FILTER (RELAX)
    // Jangan NO TRADE hanya karena volume low atau sideways biasa
    if (isExtremeVolatility) {
      return { filtered: true, reason: "Extreme volatility detected (Crypto)" };
    }
    // Filter out if trend is heavily sideways and volume is low, to avoid false signals
    // but we relax it significantly
    if (trend === "sideways" && volumeContext === "low") {
       // Only filter out if it's completely dead. For now, let's allow it to pass filter
       // and let the strategy logic catch it.
    }
    return { filtered: false };
  }

  // Saham (IDX) rules
  if (volumeContext === "low" && trend === "sideways") {
    return { filtered: true, reason: "Volume is too low and no clear trend" };
  }
  
  if (isExtremeVolatility) {
    return { filtered: true, reason: "Extreme volatility detected" };
  }

  if (trend === "sideways") {
    return { filtered: true, reason: "Market is moving sideways without a clear trend" };
  }

  return { filtered: false };
}
