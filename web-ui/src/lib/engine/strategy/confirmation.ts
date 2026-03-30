import { Candle } from "../types";

export function checkConfirmation(
  candles: Candle[],
  isVolumeSpike: boolean,
  macdSignal: "bullish" | "bearish" | "neutral",
  targetDirection: "BUY" | "SELL",
  market: "idx" | "crypto" = "idx"
): { confirmed: boolean; reasons: string[] } {
  if (candles.length < 2) return { confirmed: false, reasons: [] };

  const current = candles[candles.length - 1];
  const previous = candles[candles.length - 2];

  let confirmations = 0;
  const reasons: string[] = [];

  if (targetDirection === "BUY") {
    if (current.close > previous.close) {
      confirmations++;
      reasons.push("bullishCandle");
    }
    if (isVolumeSpike) {
      confirmations++;
      reasons.push("volumeSpike");
    }
    if (macdSignal === "bullish") {
      confirmations++;
      reasons.push("macdBullish");
    }
  } else {
    if (current.close < previous.close) {
      confirmations++;
      reasons.push("bearishCandle");
    }
    if (isVolumeSpike) {
      confirmations++;
      reasons.push("volumeSpike");
    }
    if (macdSignal === "bearish") {
      confirmations++;
      reasons.push("macdBearish");
    }
  }

  const requiredConfirmations = market === "crypto" ? 1 : 2;

  return { confirmed: confirmations >= requiredConfirmations, reasons };
}
