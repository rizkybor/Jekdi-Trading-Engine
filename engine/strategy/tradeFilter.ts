import { TrendType } from "../types";

export function isTradeFilteredOut(
  volumeContext: string,
  isExtremeVolatility: boolean,
  trend: TrendType
): { filtered: boolean; reason?: string } {
  if (volumeContext === "low") {
    return { filtered: true, reason: "Volume is too low" };
  }
  
  if (isExtremeVolatility) {
    return { filtered: true, reason: "Extreme volatility detected" };
  }

  if (trend === "sideways") {
    return { filtered: true, reason: "Market is moving sideways without a clear trend" };
  }

  return { filtered: false };
}
