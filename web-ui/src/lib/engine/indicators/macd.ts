import { IndicatorOutput } from "../types";

export function getEMASeries(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaSeries: number[] = [];

  if (data.length < period) return Array(data.length).fill(0);

  let ema = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      emaSeries.push(0);
    } else if (i === period - 1) {
      emaSeries.push(ema);
    } else {
      ema = (data[i] - ema) * k + ema;
      emaSeries.push(ema);
    }
  }

  return emaSeries;
}

export function getMACDSeries(
  data: number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const fastEma = getEMASeries(data, fastPeriod);
  const slowEma = getEMASeries(data, slowPeriod);

  const macdLine = fastEma.map((fast, i) => {
    if (slowEma[i] === 0) return 0; // Not enough data for slow EMA yet
    return fast - slowEma[i];
  });

  const signalLine = getEMASeries(macdLine.slice(slowPeriod - 1), signalPeriod);
  
  // Pad signal line to match length
  const paddedSignalLine = [
    ...Array(slowPeriod - 1).fill(0),
    ...signalLine
  ];

  const histogram = macdLine.map((macd, i) => {
    if (paddedSignalLine[i] === 0 && macd === 0) return 0;
    return macd - paddedSignalLine[i];
  });

  return { macdLine, signalLine: paddedSignalLine, histogram };
}

export function evaluateMACD(
  macdLine: number,
  signalLine: number,
  histogram: number,
  previousHistogram?: number
): IndicatorOutput {
  if (macdLine === 0 && signalLine === 0) return { value: 0, signal: "neutral", strength: 0 };

  let signal: "bullish" | "bearish" | "neutral" = "neutral";
  
  if (histogram > 0) {
    signal = "bullish";
  } else if (histogram < 0) {
    signal = "bearish";
  }

  // Cross over logic
  let strength = Math.min(Math.abs(histogram) / Math.abs(macdLine === 0 ? 1 : macdLine), 1);

  if (previousHistogram !== undefined) {
    if (previousHistogram <= 0 && histogram > 0) {
      signal = "bullish";
      strength = 1; // Strong signal on cross
    } else if (previousHistogram >= 0 && histogram < 0) {
      signal = "bearish";
      strength = 1; // Strong signal on cross
    }
  }

  return { value: macdLine, signal, strength };
}
