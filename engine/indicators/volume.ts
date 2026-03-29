import { IndicatorOutput } from "../types";

export function getVolumeMA(volumes: number[], period: number): number[] {
  if (volumes.length < period) return Array(volumes.length).fill(0);

  const result: number[] = [];
  for (let i = 0; i < volumes.length; i++) {
    if (i < period - 1) {
      result.push(0);
    } else {
      const sum = volumes.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }
  }
  return result;
}

export function evaluateVolume(currentVolume: number, volumeMA: number): IndicatorOutput {
  if (volumeMA === 0) return { value: currentVolume, signal: "neutral", strength: 0 };

  const ratio = currentVolume / volumeMA;
  let signal: "bullish" | "bearish" | "neutral" = "neutral";
  let strength = 0;

  if (ratio > 1.5) { // Spike
    signal = "bullish";
    strength = Math.min((ratio - 1) / 2, 1); // Cap at 1
  } else if (ratio < 0.5) { // Low volume
    signal = "bearish";
    strength = Math.min((1 - ratio), 1);
  }

  return { value: currentVolume, signal, strength };
}
