export function detectBreakout(
  currentPrice: number,
  resistance: number,
  support: number,
  volumeContext: string,
  rsi: number
): "BUY_BREAKOUT" | "SELL_BREAKOUT" | "NONE" {
  const isVolumeSpike = volumeContext === "spike" || volumeContext === "extreme_spike";

  // Buy Breakout: Harga menembus resistance, volume spike, RSI > 65
  if (currentPrice > resistance && isVolumeSpike && rsi > 65) {
    return "BUY_BREAKOUT";
  }

  // Sell Breakout: Harga menembus support, volume spike, RSI < 35
  if (currentPrice < support && isVolumeSpike && rsi < 35) {
    return "SELL_BREAKOUT";
  }

  return "NONE";
}
