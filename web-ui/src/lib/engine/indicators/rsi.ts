import { IndicatorOutput } from "../types";

export function getRSISeries(data: number[], period: number): number[] {
  const result: number[] = [];
  if (data.length <= period) {
    return Array(data.length).fill(0);
  }

  let avgGain = 0;
  let avgLoss = 0;

  // First RSI calculation
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) {
      avgGain += diff;
    } else {
      avgLoss -= diff; // diff is negative, so sub to add positive value
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Pad the first 'period' elements with 0
  for (let i = 0; i <= period; i++) {
    result.push(i === period ? 100 - 100 / (1 + avgGain / (avgLoss === 0 ? 1 : avgLoss)) : 0);
  }

  // Calculate the rest
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    let gain = 0;
    let loss = 0;

    if (diff > 0) {
      gain = diff;
    } else {
      loss = -diff;
    }

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
}

export function evaluateRSI(rsiValue: number): IndicatorOutput {
  if (rsiValue === 0) return { value: 0, signal: "neutral", strength: 0 };

  let signal: "bullish" | "bearish" | "neutral" = "neutral";
  let strength = 0;

  if (rsiValue > 70) {
    signal = "bearish"; // Overbought, potential reversal down
    strength = Math.min((rsiValue - 70) / 30, 1);
  } else if (rsiValue < 30) {
    signal = "bullish"; // Oversold, potential reversal up
    strength = Math.min((30 - rsiValue) / 30, 1);
  } else if (rsiValue >= 40 && rsiValue <= 60) {
    // Neutral but has strength towards middle
    strength = 1 - Math.abs(50 - rsiValue) / 10;
  }

  return { value: rsiValue, signal, strength };
}
