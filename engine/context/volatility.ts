import { Candle } from "../types";

export function detectVolatility(candles: Candle[], lookbackPeriod: number = 14): { atr: number; isExtreme: boolean } {
  if (candles.length < 2) return { atr: 0, isExtreme: false };

  const trs: number[] = [];
  const recentCandles = candles.slice(-lookbackPeriod - 1); // Need one extra for previous close

  for (let i = 1; i < recentCandles.length; i++) {
    const current = recentCandles[i];
    const previous = recentCandles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
    trs.push(tr);
  }

  const atr = trs.reduce((acc, val) => acc + val, 0) / trs.length;

  const currentTr = trs[trs.length - 1];
  const isExtreme = currentTr > atr * 2.5; // ATR multiplier for extreme volatility

  return { atr, isExtreme };
}
