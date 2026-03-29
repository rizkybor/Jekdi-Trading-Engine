import { IndicatorOutput } from "../types";

export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return 0;
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
}

export function evaluateMA(
  currentPrice: number,
  maValue: number,
  previousPrice?: number,
  previousMaValue?: number
): IndicatorOutput {
  if (maValue === 0) {
    return { value: 0, signal: "neutral", strength: 0 };
  }

  const diff = currentPrice - maValue;
  const percentageDiff = Math.abs(diff) / maValue;
  // Cap strength at 1. E.g., a 10% difference gives strength 1
  const strength = Math.min(percentageDiff * 10, 1);

  let signal: "bullish" | "bearish" | "neutral" = "neutral";
  
  if (currentPrice > maValue) {
    signal = "bullish";
  } else if (currentPrice < maValue) {
    signal = "bearish";
  }

  // Check for crossover if previous data is available
  if (previousPrice !== undefined && previousMaValue !== undefined) {
    if (previousPrice <= previousMaValue && currentPrice > maValue) {
       return { value: maValue, signal: "bullish", strength: Math.min(strength + 0.5, 1) };
    } else if (previousPrice >= previousMaValue && currentPrice < maValue) {
       return { value: maValue, signal: "bearish", strength: Math.min(strength + 0.5, 1) };
    }
  }

  return { value: maValue, signal, strength };
}

export function getMASeries(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(0);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      result.push(calculateSMA(slice, period));
    }
  }
  return result;
}
