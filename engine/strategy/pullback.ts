import { TrendType } from "../types";

export function detectPullback(
  currentPrice: number,
  maShort: number,
  rsi: number,
  trend: TrendType,
  nearSupport: boolean,
  nearResistance: boolean
): "BUY_PULLBACK" | "SELL_PULLBACK" | "NONE" {
  // Buy Pullback: Price retrace to MA20 or support, RSI 40-50
  if (trend === "uptrend") {
    const nearMaShort = Math.abs(currentPrice - maShort) / maShort <= 0.02; // 2% tolerance
    const validRsi = rsi >= 40 && rsi <= 55; // Slightly adjusted upper bound for practical pullback
    
    if ((nearMaShort || nearSupport) && validRsi) {
      return "BUY_PULLBACK";
    }
  }

  // Sell Pullback: Price retrace to MA20 or resistance, RSI 50-60
  if (trend === "downtrend") {
    const nearMaShort = Math.abs(currentPrice - maShort) / maShort <= 0.02;
    const validRsi = rsi >= 45 && rsi <= 60;

    if ((nearMaShort || nearResistance) && validRsi) {
      return "SELL_PULLBACK";
    }
  }

  return "NONE";
}
