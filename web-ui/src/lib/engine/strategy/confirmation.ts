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
      reasons.push("Bullish candle close (Close > Prev Close)");
    }
    if (isVolumeSpike) {
      confirmations++;
      reasons.push("Volume spike detected");
    }
    if (macdSignal === "bullish") {
      confirmations++;
      reasons.push("MACD indicates bullish momentum/cross");
    }
  } else {
    if (current.close < previous.close) {
      confirmations++;
      reasons.push("Bearish candle close (Close < Prev Close)");
    }
    if (isVolumeSpike) {
      confirmations++;
      reasons.push("Volume spike detected");
    }
    if (macdSignal === "bearish") {
      confirmations++;
      reasons.push("MACD indicates bearish momentum/cross");
    }
  }

  const requiredConfirmations = market === "crypto" ? 1 : 2;

  return { confirmed: confirmations >= requiredConfirmations, reasons };
}
