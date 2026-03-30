import { TrendType } from "../types";

export function detectPullback(
  currentPrice: number,
  maShort: number,
  rsi: number,
  trend: TrendType,
  nearSupport: boolean,
  nearResistance: boolean,
  market: "idx" | "crypto" = "idx"
): "BUY_PULLBACK" | "SELL_PULLBACK" | "NONE" {
  // Buy Pullback: Price retrace to MA20 or support
  if (trend === "uptrend") {
    // In crypto, give wider tolerance for pullback (e.g. 4%)
    const tolerance = market === "crypto" ? 0.04 : 0.02;
    const nearMaShort = Math.abs(currentPrice - maShort) / maShort <= tolerance; 
    const validRsi = market === "crypto" ? (rsi >= 35 && rsi <= 65) : (rsi >= 40 && rsi <= 55); 
    
    if ((nearMaShort || nearSupport) && validRsi) {
      return "BUY_PULLBACK";
    }
  }

  // Sell Pullback: Price retrace to MA20 or resistance
  if (trend === "downtrend") {
    const tolerance = market === "crypto" ? 0.04 : 0.02;
    const nearMaShort = Math.abs(currentPrice - maShort) / maShort <= tolerance;
    const validRsi = market === "crypto" ? (rsi >= 35 && rsi <= 65) : (rsi >= 45 && rsi <= 60);

    if ((nearMaShort || nearResistance) && validRsi) {
      return "SELL_PULLBACK";
    }
  }

  return "NONE";
}
